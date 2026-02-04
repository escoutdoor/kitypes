package conversation

import (
	"context"
	"errors"

	sq "github.com/Masterminds/squirrel"
	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/database"
	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/jackc/pgx/v5"
)

const (
	defaultLimit  = 10
	defaultOffset = 0

	tableName = "conversations"

	idColumn = "id"

	adIDColumn      = "ad_id"
	ownerIDColumn   = "owner_id"
	adopterIDColumn = "adopter_id"

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

func (r *Repository) Create(ctx context.Context, in entity.Conversation) (string, error) {
	sql, args, err := r.qb.Insert(tableName).
		Columns(adIDColumn, ownerIDColumn, adopterIDColumn).
		Values(in.AdID, in.OwnerID, in.AdopterID).
		Suffix("RETURNING id").
		ToSql()
	if err != nil {
		return "", buildSQLError(err)
	}

	q := database.Query{
		Sql:  sql,
		Name: "conversation_repository.Create",
	}

	var convID string
	if err := r.db.DB().QueryRowContext(ctx, q, args...).Scan(&convID); err != nil {
		return "", scanRowError(err)
	}

	return convID, nil
}

func (r *Repository) GetByID(ctx context.Context, convID string) (entity.Conversation, error) {
	sql, args, err := r.qb.Select(
		idColumn,
		adIDColumn,
		ownerIDColumn,
		adopterIDColumn,
		createdAtColumn,
	).
		Where(sq.Eq{idColumn: convID}).
		From(tableName).
		ToSql()
	if err != nil {
		return entity.Conversation{}, buildSQLError(err)
	}

	q := database.Query{
		Name: "conversation_repository.GetByID",
		Sql:  sql,
	}

	row, err := r.db.DB().QueryContext(ctx, q, args...)
	if err != nil {
		return entity.Conversation{}, executeSQLError(err)
	}
	defer row.Close()

	var conv Conversation
	if err := pgxscan.ScanOne(&conv, row); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return entity.Conversation{}, apperror.ErrConversationNotFound
		}
		return entity.Conversation{}, scanRowError(err)
	}

	return conv.ToEntity(), nil
}

func (r *Repository) GetByAdID(ctx context.Context, userID string, adID string) (entity.Conversation, error) {
	sql, args, err := r.qb.Select(
		idColumn,
		adIDColumn,
		ownerIDColumn,
		adopterIDColumn,
		createdAtColumn,
	).
		Where(sq.And{
			sq.Eq{adopterIDColumn: userID},
			sq.Eq{adIDColumn: adID},
		}).
		From(tableName).
		ToSql()
	if err != nil {
		return entity.Conversation{}, buildSQLError(err)
	}

	q := database.Query{
		Name: "conversation_repository.GetByAdID",
		Sql:  sql,
	}

	row, err := r.db.DB().QueryContext(ctx, q, args...)
	if err != nil {
		return entity.Conversation{}, executeSQLError(err)
	}
	defer row.Close()

	var conv Conversation
	if err := pgxscan.ScanOne(&conv, row); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return entity.Conversation{}, apperror.ErrConversationNotFound
		}
		return entity.Conversation{}, scanRowError(err)
	}

	return conv.ToEntity(), nil
}
