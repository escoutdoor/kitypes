package favorite

import (
	"context"

	sq "github.com/Masterminds/squirrel"
	"github.com/escoutdoor/kitypes/backend/pkg/database"
)

const (
	defaultLimit  = 10
	defaultOffset = 0

	tableName = "favorite_ads"

	idColumn     = "id"
	userIDColumn = "user_id"
	adIDColumn   = "ad_id"

	createdAtColumn = "created_at"
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
		Suffix("ON CONFLICT (user_id, ad_id) DO NOTHING").
		ToSql()
	if err != nil {
		return buildSQLError(err)
	}

	q := database.Query{
		Name: "favorite_repository.Create",
		Sql:  sql,
	}
	if _, err := r.db.DB().ExecContext(ctx, q, args...); err != nil {
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

	if _, err := r.db.DB().ExecContext(ctx, q, args...); err != nil {
		return executeSQLError(err)
	}

	return nil
}
