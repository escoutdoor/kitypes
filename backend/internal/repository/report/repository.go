package report

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

	tableName      = "reports"
	usersTableName = "users"

	idColumn         = "id"
	reporterIDColumn = "reporter_id"
	targetTypeColumn = "target_type"
	targetIDColumn   = "target_id"
	reasonColumn     = "reason"
	commentColumn    = "comment"
	statusColumn     = "status"
	adminNotesColumn = "admin_notes"
	createdAtColumn  = "created_at"
	updatedAtColumn  = "updated_at"

	constraintReportsReporterTargetUnique = "reports_reporter_target_unique"
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

func (r *Repository) Create(ctx context.Context, in entity.CreateReportInput) error {
	sql, args, err := r.qb.Insert(tableName).
		Columns(
			reporterIDColumn,
			targetTypeColumn,
			targetIDColumn,
			reasonColumn,
			commentColumn,
			statusColumn,
		).
		Values(
			in.ReporterID,
			in.TargetType,
			in.TargetID,
			in.Reason,
			in.Comment,
			entity.ReportStatusPending,
		).
		ToSql()

	if err != nil {
		return buildSQLError(err)
	}

	q := database.Query{
		Name: "report_repository.Create",
		Sql:  sql,
	}

	_, err = r.db.DB().ExecContext(ctx, q, args...)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			if pgErr.Code == pgerrcode.UniqueViolation && pgErr.ConstraintName == constraintReportsReporterTargetUnique {
				return apperror.ErrReportAlreadyExists
			}
		}

		return executeSQLError(err)
	}

	return nil
}

func (r *Repository) UpdateStatus(ctx context.Context, in entity.UpdateReportStatusInput) error {
	builder := r.qb.Update(tableName).
		Set(statusColumn, in.Status).
		Set(updatedAtColumn, sq.Expr("NOW()")).
		Where(sq.Eq{idColumn: in.ReportID})

	if in.AdminNotes != nil {
		builder = builder.Set(adminNotesColumn, *in.AdminNotes)
	}

	sql, args, err := builder.ToSql()
	if err != nil {
		return buildSQLError(err)
	}

	q := database.Query{
		Name: "report_repository.UpdateStatus",
		Sql:  sql,
	}

	cmd, err := r.db.DB().ExecContext(ctx, q, args...)
	if err != nil {
		return executeSQLError(err)
	}
	if cmd.RowsAffected() == 0 {
		return apperror.ReportNotFoundID(in.ReportID)
	}

	return nil
}

func (r *Repository) List(ctx context.Context, in entity.ListReportsInput) (entity.ListReportsOutput, error) {
	builder := r.qb.Select().
		From(tableName + " r").
		LeftJoin(usersTableName + " u ON r.reporter_id = u.id")

	if in.Status != nil {
		builder = builder.Where(sq.Eq{"r.status": *in.Status})
	}
	if in.TargetType != nil {
		builder = builder.Where(sq.Eq{"r.target_type": *in.TargetType})
	}
	if in.TargetID != nil {
		builder = builder.Where(sq.Eq{"r.target_id": *in.TargetID})
	}

	countSql, countArgs, err := builder.Columns("COUNT(*)").ToSql()
	if err != nil {
		return entity.ListReportsOutput{}, buildSQLError(err)
	}

	var total int
	qCount := database.Query{Name: "report_repository.Count", Sql: countSql}
	if err := r.db.DB().QueryRowContext(ctx, qCount, countArgs...).Scan(&total); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return entity.ListReportsOutput{}, nil
		}
		return entity.ListReportsOutput{}, scanRowError(err)
	}

	if total == 0 {
		return entity.ListReportsOutput{}, nil
	}

	limit := defaultLimit
	if in.Limit > 0 {
		limit = in.Limit
	}
	offset := defaultOffset
	if in.Offset > 0 {
		offset = in.Offset
	}

	sql, args, err := builder.Columns(
		"r.id",
		"r.reporter_id",
		"r.target_type",
		"r.target_id",
		"r.reason",
		"r.comment",
		"r.status",
		"r.admin_notes",
		"r.created_at",
		"r.updated_at",
		"COALESCE(u.first_name, 'Deleted') AS reporter_first_name",
		"COALESCE(u.last_name, 'User') AS reporter_last_name",
		"COALESCE(u.email, 'deleted@kitypes.local') AS reporter_email",
	).
		OrderBy("r.created_at DESC").
		Limit(uint64(limit)).
		Offset(uint64(offset)).
		ToSql()

	if err != nil {
		return entity.ListReportsOutput{}, buildSQLError(err)
	}

	qList := database.Query{Name: "report_repository.List", Sql: sql}
	rows, err := r.db.DB().QueryContext(ctx, qList, args...)
	if err != nil {
		return entity.ListReportsOutput{}, executeSQLError(err)
	}
	defer rows.Close()

	var enrichedReports EnrichedReports
	if err := pgxscan.ScanAll(&enrichedReports, rows); err != nil {
		return entity.ListReportsOutput{}, scanRowsError(err)
	}

	return entity.ListReportsOutput{
		Reports: enrichedReports.ToEntityList(),
		Total:   total,
	}, nil
}

func (r *Repository) GetByID(ctx context.Context, reportID string) (entity.EnrichedReport, error) {
	sql, args, err := r.qb.Select(
		"r.id",
		"r.reporter_id",
		"r.target_type",
		"r.target_id",
		"r.reason",
		"r.comment",
		"r.status",
		"r.admin_notes",
		"r.created_at",
		"r.updated_at",
		"COALESCE(u.first_name, 'Deleted') AS reporter_first_name",
		"COALESCE(u.last_name, 'User') AS reporter_last_name",
		"COALESCE(u.email, 'deleted@kitypes.local') AS reporter_email",
	).
		From(tableName + " r").
		LeftJoin(usersTableName + " u ON r.reporter_id = u.id").
		Where(sq.Eq{"r.id": reportID}).
		ToSql()

	if err != nil {
		return entity.EnrichedReport{}, buildSQLError(err)
	}

	q := database.Query{
		Name: "report_repository.GetByID",
		Sql:  sql,
	}

	row, err := r.db.DB().QueryContext(ctx, q, args...)
	if err != nil {
		return entity.EnrichedReport{}, executeSQLError(err)
	}
	defer row.Close()

	var report EnrichedReport
	if err := pgxscan.ScanOne(&report, row); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return entity.EnrichedReport{}, apperror.ReportNotFoundID(reportID)
		}

		return entity.EnrichedReport{}, scanRowError(err)
	}

	return report.ToEntity(), nil
}

func (r *Repository) GetLastResolvedReason(ctx context.Context, targetID string) (*string, error) {
	sql, args, err := r.qb.Select("admin_notes").
		From(tableName).
		Where(sq.Eq{
			targetTypeColumn: entity.TargetTypeAd,
			targetIDColumn:   targetID,
			statusColumn:     entity.ReportStatusResolved,
		}).
		Where(sq.NotEq{adminNotesColumn: nil}).
		OrderBy("updated_at DESC").
		Limit(1).
		ToSql()

	if err != nil {
		return nil, buildSQLError(err)
	}

	q := database.Query{
		Name: "report_repository.GetLastResolvedReason",
		Sql:  sql,
	}

	var adminNotes string
	if err := r.db.DB().QueryRowContext(ctx, q, args...).Scan(&adminNotes); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}

		return nil, scanRowError(err)
	}

	return &adminNotes, nil
}
