package verification

import (
	"context"
	"errors"

	sq "github.com/Masterminds/squirrel"
	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/database"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/jackc/pgerrcode"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

const (
	defaultLimit  = 10
	defaultOffset = 0

	tableName          = "verification_requests"
	documentsTableName = "verification_requests_documents"
	usersTableName     = "users"

	idColumn            = "id"
	userIDColumn        = "user_id"
	requestedRoleColumn = "requested_role"

	statusColumn     = "status"
	adminNotesColumn = "admin_notes"

	createdAtColumn = "created_at"
	updatedAtColumn = "updated_at"

	// verification_requests_documents columns
	requestIDColumn   = "request_id"
	documentKeyColumn = "document_key"

	constraintOnePendingVerificationRequestPerUser = "idx_one_pending_request_per_user"
)

type Repository struct {
	db database.Client
	qb sq.StatementBuilderType
}

func New(db database.Client) *Repository {
	return &Repository{
		db: db,
		qb: sq.StatementBuilder.PlaceholderFormat(sq.Dollar),
	}
}

func (r *Repository) GetVerificationRequestForUpdate(ctx context.Context, requestID string) (entity.VerificationRequest, error) {
	sql, args, err := r.qb.Select(
		idColumn,
		userIDColumn,
		requestedRoleColumn,
		statusColumn,
		adminNotesColumn,
		createdAtColumn,
		updatedAtColumn,
	).
		From(tableName).
		Where(sq.Eq{idColumn: requestID}).
		Suffix("FOR UPDATE").
		ToSql()
	if err != nil {
		return entity.VerificationRequest{}, buildSQLError(err)
	}

	q := database.Query{
		Name: "verification_repository.GetVerificationRequestForUpdate",
		Sql:  sql,
	}

	row, err := r.db.DB().QueryContext(ctx, q, args...)
	if err != nil {
		return entity.VerificationRequest{}, executeSQLError(err)
	}
	defer row.Close()

	var vr VerificationRequest
	if err := pgxscan.ScanOne(&vr, row); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return entity.VerificationRequest{}, apperror.VerificationRequestNotFoundID(requestID)
		}
		return entity.VerificationRequest{}, scanRowError(err)
	}

	keys, err := r.GetDocumentKeys(ctx, vr.ID)
	if err != nil {
		return entity.VerificationRequest{}, errwrap.Wrap("get document keys", err)
	}

	vr.DocumentKeys = keys
	return vr.ToEntity(), nil
}

func (r *Repository) GetLatestRequestByUserID(ctx context.Context, userID string) (entity.VerificationRequest, error) {
	sql, args, err := r.qb.Select(
		idColumn,
		userIDColumn,
		requestedRoleColumn,
		statusColumn,
		adminNotesColumn,
		createdAtColumn,
		updatedAtColumn,
	).
		From(tableName).
		Where(sq.Eq{userIDColumn: userID}).
		OrderBy("id DESC").
		Limit(1).
		ToSql()
	if err != nil {
		return entity.VerificationRequest{}, buildSQLError(err)
	}

	q := database.Query{
		Name: "verification_repository.GetLatestRequestByUserID",
		Sql:  sql,
	}

	row, err := r.db.DB().QueryContext(ctx, q, args...)
	if err != nil {
		return entity.VerificationRequest{}, executeSQLError(err)
	}
	defer row.Close()

	var vr VerificationRequest
	if err := pgxscan.ScanOne(&vr, row); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return entity.VerificationRequest{}, apperror.VerificationRequestNotFoundByUserID(userID)
		}

		return entity.VerificationRequest{}, scanRowError(err)
	}

	keys, err := r.GetDocumentKeys(ctx, vr.ID)
	if err != nil {
		return entity.VerificationRequest{}, errwrap.Wrap("get document keys", err)
	}

	vr.DocumentKeys = keys
	return vr.ToEntity(), nil
}

func (r *Repository) CreateVerificationRequest(ctx context.Context, in entity.CreateVerificationRequestInput) (entity.VerificationRequest, error) {
	sql, args, err := r.qb.Insert(tableName).
		Columns(
			userIDColumn,
			requestedRoleColumn,
			statusColumn,
		).
		Values(
			in.UserID,
			in.RequestedRole,
			entity.VerificationStatusPending,
		).
		Suffix(`
			RETURNING 
				id,
				user_id,
				requested_role,
				status,
				admin_notes,
				created_at,
				updated_at
		`).
		ToSql()
	if err != nil {
		return entity.VerificationRequest{}, buildSQLError(err)
	}

	q := database.Query{
		Name: "verification_repository.CreateVerificationRequest",
		Sql:  sql,
	}

	row, err := r.db.DB().QueryContext(ctx, q, args...)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			if pgErr.Code == pgerrcode.UniqueViolation {
				switch pgErr.ConstraintName {
				case constraintOnePendingVerificationRequestPerUser:
					return entity.VerificationRequest{}, apperror.ErrVerificationRequestAlreadySent
				}
			}
		}
		return entity.VerificationRequest{}, executeSQLError(err)
	}
	defer row.Close()

	var vr VerificationRequest
	if err := pgxscan.ScanOne(&vr, row); err != nil {
		return entity.VerificationRequest{}, scanRowError(err)
	}

	return vr.ToEntity(), nil
}

func (r *Repository) UpdateVerificationRequest(ctx context.Context, in entity.UpdateVerificationStatusInput) error {
	builder := r.qb.Update(tableName).
		Set(statusColumn, in.Status).
		Set(updatedAtColumn, sq.Expr("NOW()")).
		Where(sq.Eq{idColumn: in.RequestID})

	if in.AdminNotes != nil {
		builder = builder.Set(adminNotesColumn, *in.AdminNotes)
	}

	sql, args, err := builder.ToSql()
	if err != nil {
		return buildSQLError(err)
	}

	q := database.Query{
		Name: "verification_repository.UpdateVerificationRequest",
		Sql:  sql,
	}

	cmd, err := r.db.DB().ExecContext(ctx, q, args...)
	if err != nil {
		return executeSQLError(err)
	}
	if cmd.RowsAffected() == 0 {
		return apperror.VerificationRequestNotFoundID(in.RequestID)
	}

	return nil
}

func (r *Repository) AddDocuments(ctx context.Context, requestID string, keys []string) error {
	if len(keys) == 0 {
		return nil
	}

	builder := r.qb.Insert(documentsTableName).Columns(requestIDColumn, documentKeyColumn)
	for _, k := range keys {
		builder = builder.Values(requestID, k)
	}

	sql, args, err := builder.ToSql()
	if err != nil {
		return buildSQLError(err)
	}

	q := database.Query{
		Name: "verification_repository.AddDocuments",
		Sql:  sql,
	}

	_, err = r.db.DB().ExecContext(ctx, q, args...)
	if err != nil {
		return executeSQLError(err)
	}

	return nil
}

func (r *Repository) GetDocumentKeys(ctx context.Context, requestID string) ([]string, error) {
	sql, args, err := r.qb.Select(documentKeyColumn).
		From(documentsTableName).
		Where(sq.Eq{requestIDColumn: requestID}).
		ToSql()
	if err != nil {
		return nil, buildSQLError(err)
	}

	q := database.Query{
		Name: "verification_repository.GetDocumentKeys",
		Sql:  sql,
	}

	rows, err := r.db.DB().QueryContext(ctx, q, args...)
	if err != nil {
		return nil, executeSQLError(err)
	}
	defer rows.Close()

	var keys []string
	if err := pgxscan.ScanAll(&keys, rows); err != nil {
		return nil, scanRowsError(err)
	}

	return keys, nil
}

func (r *Repository) ListVerifications(ctx context.Context, in entity.ListVerificationsInput) (entity.ListVerificationsOutput, error) {
	var (
		limit  = defaultLimit
		offset = defaultOffset
	)

	builder := r.qb.Select().
		From(tableName + " vr").
		Join(usersTableName + " u ON vr.user_id = u.id")

	if in.Status != nil {
		builder = builder.Where(sq.Eq{"vr.status": *in.Status})
	}
	if in.UserID != nil {
		builder = builder.Where(sq.Eq{"vr.user_id": *in.UserID})
	}
	if in.Query != nil {
		// using ILike for case-insensitive search across name and email
		queryPattern := "%" + *in.Query + "%"
		builder = builder.Where(sq.Or{
			sq.ILike{"u.first_name": queryPattern},
			sq.ILike{"u.last_name": queryPattern},
			sq.ILike{"u.email": queryPattern},
		})
	}

	total, err := r.countVerifications(ctx, builder.Columns("COUNT(*)"))
	if err != nil {
		return entity.ListVerificationsOutput{}, err
	}
	if total == 0 {
		return entity.ListVerificationsOutput{}, nil
	}

	if in.Limit > 0 {
		limit = in.Limit
	}
	if in.Offset > 0 {
		offset = in.Offset
	}

	builder = builder.Columns(
		"vr.id",
		"vr.user_id",
		"vr.requested_role",
		"vr.status",
		"vr.admin_notes",
		"vr.created_at",
		"vr.updated_at",
		"u.first_name AS user_first_name",
		"u.last_name AS user_last_name",
		"u.email AS user_email",
		"u.phone_number AS user_phone_number",
		"u.avatar_key AS user_avatar_key",
	).
		OrderBy("vr.created_at DESC").
		Limit(uint64(limit)).
		Offset(uint64(offset))

	sql, args, err := builder.ToSql()
	if err != nil {
		return entity.ListVerificationsOutput{}, buildSQLError(err)
	}

	q := database.Query{
		Name: "verification_repository.ListVerifications",
		Sql:  sql,
	}

	rows, err := r.db.DB().QueryContext(ctx, q, args...)
	if err != nil {
		return entity.ListVerificationsOutput{}, executeSQLError(err)
	}
	defer rows.Close()

	var dbRequests EnrichedVerificationRequests
	if err := pgxscan.ScanAll(&dbRequests, rows); err != nil {
		return entity.ListVerificationsOutput{}, scanRowsError(err)
	}

	reqIDs := make([]string, len(dbRequests))
	for i, req := range dbRequests {
		reqIDs[i] = req.ID
	}

	docMap, err := r.getDocumentKeysMapForRequests(ctx, reqIDs)
	if err != nil {
		return entity.ListVerificationsOutput{}, errwrap.Wrap("get document keys map", err)
	}

	for i := range dbRequests {
		dbRequests[i].DocumentKeys = docMap[dbRequests[i].ID]
	}

	return entity.ListVerificationsOutput{
		Total:    total,
		Requests: dbRequests.ToEntityList(),
	}, nil
}

func (r *Repository) countVerifications(ctx context.Context, builder sq.SelectBuilder) (int, error) {
	sql, args, err := builder.ToSql()
	if err != nil {
		return 0, buildSQLError(err)
	}

	q := database.Query{
		Name: "verification_repository.countVerifications",
		Sql:  sql,
	}

	var total int
	if err := r.db.DB().QueryRowContext(ctx, q, args...).Scan(&total); err != nil {
		return 0, scanRowError(err)
	}

	return total, nil
}

func (r *Repository) getDocumentKeysMapForRequests(ctx context.Context, reqIDs []string) (map[string][]string, error) {
	if len(reqIDs) == 0 {
		return make(map[string][]string), nil
	}

	sql, args, err := r.qb.Select(requestIDColumn, documentKeyColumn).
		From(documentsTableName).
		Where(sq.Eq{requestIDColumn: reqIDs}).
		ToSql()
	if err != nil {
		return nil, buildSQLError(err)
	}

	q := database.Query{
		Name: "verification_repository.getDocumentKeysMapForRequests",
		Sql:  sql,
	}

	rows, err := r.db.DB().QueryContext(ctx, q, args...)
	if err != nil {
		return nil, executeSQLError(err)
	}
	defer rows.Close()

	var docs []documentMapping
	if err := pgxscan.ScanAll(&docs, rows); err != nil {
		return nil, scanRowsError(err)
	}

	docMap := make(map[string][]string)
	for _, doc := range docs {
		docMap[doc.RequestID] = append(docMap[doc.RequestID], doc.Key)
	}

	return docMap, nil
}

func (r *Repository) DeleteDocuments(ctx context.Context, requestID string) error {
	sql, args, err := r.qb.Delete(documentsTableName).
		Where(sq.Eq{requestIDColumn: requestID}).
		ToSql()
	if err != nil {
		return buildSQLError(err)
	}

	q := database.Query{
		Name: "verification_repository.DeleteDocuments",
		Sql:  sql,
	}

	if _, err := r.db.DB().ExecContext(ctx, q, args...); err != nil {
		return executeSQLError(err)
	}

	return nil
}
