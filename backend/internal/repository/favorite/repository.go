package favorite

import (
	"context"
	"errors"

	sq "github.com/Masterminds/squirrel"
	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/database"
	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/jackc/pgerrcode"
	"github.com/jackc/pgx/v5/pgconn"
)

const (
	defaultLimit  = 10
	defaultOffset = 0

	tableName = "favorite_ads"

	idColumn     = "id"
	userIDColumn = "user_id"
	adIDColumn   = "ad_id"

	createdAtColumn = "created_at"

	constraintUniqueFavorite = "favorite_ads_user_id_ad_id_key"
	constraintFKUser         = "favorite_ads_user_id_fkey"
	constraintFKAd           = "favorite_ads_ad_id_fkey"
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

func (r *Repository) Create(ctx context.Context, userID string, adID string) error {
	sql, args, err := r.qb.Insert(tableName).
		Columns(userIDColumn, adIDColumn).
		Values(userID, adID).
		ToSql()
	if err != nil {
		return buildSQLError(err)
	}

	q := database.Query{
		Name: "favorite_repository.Create",
		Sql:  sql,
	}

	if _, err := r.db.DB().ExecContext(ctx, q, args...); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			switch pgErr.Code {
			case pgerrcode.UniqueViolation:
				if pgErr.ConstraintName == constraintUniqueFavorite {
					return apperror.ErrAdAlreadyFavorited
				}

			case pgerrcode.ForeignKeyViolation:
				switch pgErr.ConstraintName {
				case constraintFKAd:
					return apperror.AdNotFoundID(adID)
				case constraintFKUser:
					return apperror.UserNotFoundID(userID)
				}
			}
		}
		return executeSQLError(err)
	}

	return nil
}

func (r *Repository) Delete(ctx context.Context, userID string, adID string) error {
	sql, args, err := r.qb.Delete(tableName).
		Where(sq.Eq{
			userIDColumn: userID,
			adIDColumn:   adID,
		}).
		ToSql()
	if err != nil {
		return buildSQLError(err)
	}

	q := database.Query{
		Name: "favorite_repository.Delete",
		Sql:  sql,
	}

	cmd, err := r.db.DB().ExecContext(ctx, q, args...)
	if err != nil {
		return executeSQLError(err)
	}

	if cmd.RowsAffected() == 0 {
		return apperror.ErrFavoriteNotFound
	}

	return nil
}

func (r *Repository) List(ctx context.Context, in entity.ListFavoritesInput) (entity.ListFavoritesOutput, error) {
	var (
		limit  = defaultLimit
		offset = defaultOffset
	)

	builder := r.qb.Select().
		From(tableName + " f").
		Join("advertisements a ON f.ad_id = a.id").
		Where(sq.Eq{"f." + userIDColumn: in.UserID}).
		Where(sq.NotEq{"a.status": entity.AdStatusBlocked})

	total, err := r.count(ctx, builder.Columns("COUNT(*)"))
	if err != nil {
		return entity.ListFavoritesOutput{}, err
	}
	if total == 0 {
		return entity.ListFavoritesOutput{}, nil
	}

	switch in.SortBy {
	case "dateAsc":
		builder = builder.OrderBy("f.created_at ASC")
	case "dateDesc":
		builder = builder.OrderBy("f.created_at DESC")
	default:
		builder = builder.OrderBy("f.created_at DESC")
	}

	if in.Limit > 0 {
		limit = in.Limit
	}
	if in.Offset > 0 {
		offset = in.Offset
	}

	sql, args, err := builder.
		Columns("f."+idColumn, "f."+adIDColumn, "f."+createdAtColumn).
		Limit(uint64(limit)).
		Offset(uint64(offset)).
		ToSql()

	if err != nil {
		return entity.ListFavoritesOutput{}, buildSQLError(err)
	}

	q := database.Query{
		Name: "favorite_repository.List",
		Sql:  sql,
	}

	rows, err := r.db.DB().QueryContext(ctx, q, args...)
	if err != nil {
		return entity.ListFavoritesOutput{}, executeSQLError(err)
	}
	defer rows.Close()

	var favorites Favorites
	if err := pgxscan.ScanAll(&favorites, rows); err != nil {
		return entity.ListFavoritesOutput{}, scanRowsError(err)
	}

	return entity.ListFavoritesOutput{
		Total:     total,
		Favorites: favorites.ToEntities(),
	}, nil
}

func (r *Repository) count(ctx context.Context, builder sq.SelectBuilder) (int, error) {
	sql, args, err := builder.ToSql()
	if err != nil {
		return 0, buildSQLError(err)
	}

	q := database.Query{
		Name: "favorite_repository.count",
		Sql:  sql,
	}

	var total int
	if err := r.db.DB().QueryRowContext(ctx, q, args...).Scan(&total); err != nil {
		return 0, scanRowError(err)
	}

	return total, nil
}
