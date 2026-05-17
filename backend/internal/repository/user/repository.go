package user

import (
	"context"
	"errors"

	sq "github.com/Masterminds/squirrel"
	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/database"
	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/jackc/pgerrcode"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

const (
	defaultLimit  = 10
	defaultOffset = 0

	tableName = "users"

	idColumn   = "id"
	roleColumn = "role"

	avatarKeyColumn = "avatar_key"

	firstNameColumn = "first_name"
	lastNameColumn  = "last_name"

	emailColumn       = "email"
	phoneNumberColumn = "phone_number"

	passwordColumn = "password"

	isBannedColumn = "is_banned"

	createdAtColumn = "created_at"
	updatedAtColumn = "updated_at"
)

const (
	constraintUsersEmailKey       = "users_email_key"
	constraintUsersPhoneNumberKey = "users_phone_number_key"
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

func (r *Repository) GetByEmail(ctx context.Context, email string) (entity.User, error) {
	sql, args, err := r.qb.Select(
		idColumn,
		roleColumn,
		avatarKeyColumn,
		firstNameColumn,
		lastNameColumn,
		emailColumn,
		phoneNumberColumn,
		passwordColumn,
		isBannedColumn,
		createdAtColumn,
		updatedAtColumn,
	).
		From(tableName).
		Where(sq.Eq{emailColumn: email}).
		ToSql()
	if err != nil {
		return entity.User{}, buildSQLError(err)
	}

	q := database.Query{
		Name: "user_repository.GetByEmail",
		Sql:  sql,
	}
	row, err := r.db.DB().QueryContext(ctx, q, args...)
	if err != nil {
		return entity.User{}, executeSQLError(err)
	}
	defer row.Close()

	var u User
	if err := pgxscan.ScanOne(&u, row); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return entity.User{}, apperror.UserNotFoundEmail(email)
		}

		return entity.User{}, scanRowError(err)
	}

	return u.ToEntity(), nil
}

func (r *Repository) GetByID(ctx context.Context, userID string) (entity.User, error) {
	sql, args, err := r.qb.Select(
		idColumn,
		roleColumn,
		avatarKeyColumn,
		firstNameColumn,
		lastNameColumn,
		emailColumn,
		phoneNumberColumn,
		passwordColumn,
		isBannedColumn,
		createdAtColumn,
		updatedAtColumn,
	).
		From(tableName).
		Where(sq.Eq{idColumn: userID}).
		ToSql()
	if err != nil {
		return entity.User{}, buildSQLError(err)
	}

	q := database.Query{
		Name: "user_repository.GetByID",
		Sql:  sql,
	}
	row, err := r.db.DB().QueryContext(ctx, q, args...)
	if err != nil {
		return entity.User{}, executeSQLError(err)
	}
	defer row.Close()

	var u User
	if err := pgxscan.ScanOne(&u, row); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return entity.User{}, apperror.UserNotFoundID(userID)
		}

		return entity.User{}, scanRowError(err)
	}

	return u.ToEntity(), nil
}

func (r *Repository) ListByIDs(ctx context.Context, userIDs []string) ([]entity.User, error) {
	if len(userIDs) == 0 {
		return []entity.User{}, nil
	}

	sql, args, err := r.qb.Select(
		idColumn,
		roleColumn,
		avatarKeyColumn,
		firstNameColumn,
		lastNameColumn,
		emailColumn,
		phoneNumberColumn,
		passwordColumn,
		isBannedColumn,
		createdAtColumn,
		updatedAtColumn,
	).
		From(tableName).
		Where(sq.Eq{idColumn: userIDs}).
		ToSql()
	if err != nil {
		return nil, buildSQLError(err)
	}

	q := database.Query{
		Name: "user_repository.ListByIDs",
		Sql:  sql,
	}

	rows, err := r.db.DB().QueryContext(ctx, q, args...)
	if err != nil {
		return nil, executeSQLError(err)
	}
	defer rows.Close()

	var users Users
	if err := pgxscan.ScanAll(&users, rows); err != nil {
		return nil, scanRowsError(err)
	}

	return users.ToEntities(), nil
}

func (r *Repository) Create(ctx context.Context, in entity.CreateUserInput) (string, error) {
	sql, args, err := r.qb.Insert(tableName).
		Columns(
			roleColumn,
			firstNameColumn,
			lastNameColumn,
			emailColumn,
			phoneNumberColumn,
			passwordColumn,
		).
		Values(
			entity.RoleUser,
			in.FirstName,
			in.LastName,
			in.Email,
			in.PhoneNumber,
			in.Password,
		).
		Suffix("RETURNING id").
		ToSql()
	if err != nil {
		return "", buildSQLError(err)
	}

	q := database.Query{
		Name: "user_repository.CreateUser",
		Sql:  sql,
	}

	var createdUserID string
	if err := r.db.DB().QueryRowContext(ctx, q, args...).Scan(&createdUserID); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			switch pgErr.Code {
			case pgerrcode.UniqueViolation:
				if pgErr.ConstraintName == constraintUsersEmailKey {
					return "", apperror.UserEmailAlreadyExists(in.Email)
				}

				if pgErr.ConstraintName == constraintUsersPhoneNumberKey {
					return "", apperror.UserPhoneAlreadyExists(in.PhoneNumber)
				}
			}
		}

		return "", scanRowError(err)
	}

	return createdUserID, nil
}

func (r *Repository) Update(ctx context.Context, in entity.UpdateUserInput) (entity.User, error) {
	builder := r.qb.Update(tableName).
		Where(sq.Eq{idColumn: in.ID}).
		Set(updatedAtColumn, sq.Expr("NOW()")).
		Suffix(`RETURNING 
            id,
			role,
			avatar_key,
            first_name,
            last_name,
            email,
            phone_number,
            password,
			is_banned,
            created_at,
            updated_at
        `)
	if in.AvatarKey != nil {
		builder = builder.Set(avatarKeyColumn, *in.AvatarKey)
	}
	if in.FirstName != nil {
		builder = builder.Set(firstNameColumn, *in.FirstName)
	}
	if in.LastName != nil {
		builder = builder.Set(lastNameColumn, *in.LastName)
	}
	if in.PhoneNumber != nil {
		builder = builder.Set(phoneNumberColumn, *in.PhoneNumber)
	}

	sql, args, err := builder.ToSql()
	if err != nil {
		return entity.User{}, buildSQLError(err)
	}

	q := database.Query{
		Name: "user_repository.Update",
		Sql:  sql,
	}

	row, err := r.db.DB().QueryContext(ctx, q, args...)
	if err != nil {
		return entity.User{}, executeSQLError(err)
	}
	defer row.Close()

	var u User
	if err := pgxscan.ScanOne(&u, row); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			if pgErr.Code == pgerrcode.UniqueViolation {
				switch pgErr.ConstraintName {
				case constraintUsersPhoneNumberKey:
					return entity.User{}, apperror.UserPhoneAlreadyExists(*in.PhoneNumber)
				}
			}
		}

		return entity.User{}, scanRowError(err)
	}

	return u.ToEntity(), nil
}

func (r *Repository) DeleteAvatar(ctx context.Context, userID string) error {
	sql, args, err := r.qb.Update(tableName).
		Set(avatarKeyColumn, nil).
		Where(sq.Eq{idColumn: userID}).
		ToSql()
	if err != nil {
		return buildSQLError(err)
	}

	q := database.Query{
		Name: "user_repository.DeleteAvatar",
		Sql:  sql,
	}

	cmd, err := r.db.DB().ExecContext(ctx, q, args...)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return apperror.UserNotFoundID(userID)
	}

	return nil
}

func (r *Repository) UpdatePassword(ctx context.Context, userID string, password string) error {
	sql, args, err := r.qb.Update(tableName).
		Set(passwordColumn, password).
		Where(sq.Eq{idColumn: userID}).
		ToSql()
	if err != nil {
		return buildSQLError(err)
	}

	q := database.Query{
		Name: "user_repository.UpdatePassword",
		Sql:  sql,
	}

	cmd, err := r.db.DB().ExecContext(ctx, q, args...)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return apperror.UserNotFoundID(userID)
	}

	return nil
}

func (r *Repository) UpdateEmail(ctx context.Context, userID, email string) error {
	sql, args, err := r.qb.Update(tableName).
		Set(emailColumn, email).
		Where(sq.Eq{idColumn: userID}).
		ToSql()
	if err != nil {
		return buildSQLError(err)
	}

	q := database.Query{
		Name: "user_repository.UpdateEmail",
		Sql:  sql,
	}

	cmd, err := r.db.DB().ExecContext(ctx, q, args...)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == pgerrcode.UniqueViolation {
			if pgErr.ConstraintName == constraintUsersEmailKey {
				return apperror.UserEmailAlreadyExists(email)
			}
		}
		return err
	}
	if cmd.RowsAffected() == 0 {
		return apperror.UserNotFoundID(userID)
	}

	return nil
}

func (r *Repository) Delete(ctx context.Context, userID string) error {
	sql, args, err := r.qb.Delete(tableName).
		Where(sq.Eq{idColumn: userID}).
		ToSql()
	if err != nil {
		return buildSQLError(err)
	}

	q := database.Query{
		Name: "user_repository.Delete",
		Sql:  sql,
	}

	cmd, err := r.db.DB().ExecContext(ctx, q, args...)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return apperror.UserNotFoundID(userID)
	}

	return nil
}

func (r *Repository) UpdateRole(ctx context.Context, userID string, role entity.UserRole) error {
	sql, args, err := r.qb.Update(tableName).
		Set(roleColumn, role).
		Set(updatedAtColumn, sq.Expr("NOW()")).
		Where(sq.Eq{idColumn: userID}).
		ToSql()
	if err != nil {
		return buildSQLError(err)
	}

	q := database.Query{
		Name: "user_repository.UpdateRole",
		Sql:  sql,
	}

	cmd, err := r.db.DB().ExecContext(ctx, q, args...)
	if err != nil {
		return executeSQLError(err)
	}
	if cmd.RowsAffected() == 0 {
		return apperror.UserNotFoundID(userID)
	}

	return nil
}

func (r *Repository) Ban(ctx context.Context, userID string) error {
	sql, args, err := r.qb.Update(tableName).
		Set(isBannedColumn, true).
		Set(updatedAtColumn, sq.Expr("NOW()")).
		Where(sq.Eq{idColumn: userID}).
		ToSql()
	if err != nil {
		return buildSQLError(err)
	}

	q := database.Query{
		Name: "user_repository.Ban",
		Sql:  sql,
	}

	cmd, err := r.db.DB().ExecContext(ctx, q, args...)
	if err != nil {
		return executeSQLError(err)
	}
	if cmd.RowsAffected() == 0 {
		return apperror.UserNotFoundID(userID)
	}

	return nil
}

func (r *Repository) Unban(ctx context.Context, userID string) error {
	sql, args, err := r.qb.Update(tableName).
		Set(isBannedColumn, false).
		Set(updatedAtColumn, sq.Expr("NOW()")).
		Where(sq.Eq{idColumn: userID}).
		ToSql()
	if err != nil {
		return buildSQLError(err)
	}

	q := database.Query{
		Name: "user_repository.Unban",
		Sql:  sql,
	}

	cmd, err := r.db.DB().ExecContext(ctx, q, args...)
	if err != nil {
		return executeSQLError(err)
	}

	if cmd.RowsAffected() == 0 {
		return apperror.UserNotFoundID(userID)
	}

	return nil
}

func (r *Repository) List(ctx context.Context, in entity.ListUsersInput) (entity.ListUsersOutput, error) {
	var (
		limit  = defaultLimit
		offset = defaultOffset
	)

	builder := r.qb.Select().From(tableName)

	if in.ID != nil {
		builder = builder.Where(sq.Eq{idColumn: *in.ID})
	}
	if in.Role != nil {
		builder = builder.Where(sq.Eq{roleColumn: *in.Role})
	}
	if in.IsBanned != nil {
		builder = builder.Where(sq.Eq{isBannedColumn: *in.IsBanned})
	}
	if in.Search != nil {
		term := "%" + *in.Search + "%"
		builder = builder.Where(sq.Or{
			sq.ILike{firstNameColumn: term},
			sq.ILike{lastNameColumn: term},
			sq.ILike{emailColumn: term},
			sq.ILike{phoneNumberColumn: term},
		})
	}

	total, err := r.countUsers(ctx, builder.Columns("COUNT(*)"))
	if err != nil {
		return entity.ListUsersOutput{}, err
	}
	if total == 0 {
		return entity.ListUsersOutput{}, nil
	}

	if in.Limit > 0 {
		limit = in.Limit
	}
	if in.Offset > 0 {
		offset = in.Offset
	}

	sql, args, err := builder.Columns(
		idColumn,
		roleColumn,
		avatarKeyColumn,
		firstNameColumn,
		lastNameColumn,
		emailColumn,
		phoneNumberColumn,
		passwordColumn,
		isBannedColumn,
		createdAtColumn,
		updatedAtColumn,
	).
		OrderBy(createdAtColumn + " DESC").
		Limit(uint64(limit)).
		Offset(uint64(offset)).
		ToSql()

	if err != nil {
		return entity.ListUsersOutput{}, buildSQLError(err)
	}

	q := database.Query{
		Name: "user_repository.List",
		Sql:  sql,
	}

	rows, err := r.db.DB().QueryContext(ctx, q, args...)
	if err != nil {
		return entity.ListUsersOutput{}, executeSQLError(err)
	}
	defer rows.Close()

	var users Users
	if err := pgxscan.ScanAll(&users, rows); err != nil {
		return entity.ListUsersOutput{}, scanRowsError(err)
	}

	return entity.ListUsersOutput{
		Users: users.ToEntities(),
		Total: total,
	}, nil
}

func (r *Repository) countUsers(ctx context.Context, builder sq.SelectBuilder) (int, error) {
	sql, args, err := builder.ToSql()
	if err != nil {
		return 0, buildSQLError(err)
	}

	q := database.Query{
		Name: "user_repository.countUsers",
		Sql:  sql,
	}

	var total int
	if err := r.db.DB().QueryRowContext(ctx, q, args...).Scan(&total); err != nil {
		return 0, scanRowError(err)
	}

	return total, nil
}
