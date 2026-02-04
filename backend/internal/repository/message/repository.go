package message

import (
	"context"

	sq "github.com/Masterminds/squirrel"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/database"
)

const (
	defaultLimit  = 10
	defaultOffset = 0

	tableName = "conversation_messages"

	idColumn = "id"

	conversationIDColumn = "conversation_id"
	senderIDColumn       = "sender_id"
	contentColumn        = "content"

	isReadColumn = "is_read"

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

func (r *Repository) Create(ctx context.Context, in entity.Message) error {
	sql, args, err := r.qb.Insert(tableName).
		Columns(conversationIDColumn, senderIDColumn, contentColumn, isReadColumn).
		Values(in.ConversationID, in.SenderID, in.Content, false).
		ToSql()
	if err != nil {
		return buildSQLError(err)
	}

	q := database.Query{
		Sql:  sql,
		Name: "message_repository.Create",
	}

	if _, err := r.db.DB().ExecContext(ctx, q, args...); err != nil {
		return executeSQLError(err)
	}

	return nil
}
