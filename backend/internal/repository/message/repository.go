package message

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
	tableName = "conversation_messages"

	idColumn = "id"

	conversationIDColumn = "conversation_id"
	senderIDColumn       = "sender_id"
	contentColumn        = "content"

	isReadColumn = "is_read"

	createdAtColumn = "created_at"

	constraintConversationMessagesConversationIDFKey = "conversation_messages_conversation_id_fkey"
	constraintConversationMessagesSenderIDFKey       = "conversation_messages_sender_id_fkey"
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

func (r *Repository) Create(ctx context.Context, in entity.Message) (string, error) {
	sql, args, err := r.qb.Insert(tableName).
		Columns(conversationIDColumn, senderIDColumn, contentColumn, isReadColumn).
		Values(in.ConversationID, in.SenderID, in.Content, false).
		Suffix("RETURNING id").
		ToSql()
	if err != nil {
		return "", buildSQLError(err)
	}

	q := database.Query{
		Sql:  sql,
		Name: "message_repository.Create",
	}

	var id string
	if err := r.db.DB().QueryRowContext(ctx, q, args...).Scan(&id); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == pgerrcode.ForeignKeyViolation {
			switch pgErr.ConstraintName {
			case constraintConversationMessagesConversationIDFKey:
				return "", apperror.ConversationNotFoundID(in.ConversationID)
			case constraintConversationMessagesSenderIDFKey:
				return "", apperror.UserNotFoundID(in.SenderID)
			}
		}

		return "", scanRowError(err)
	}

	return id, nil
}

func (r *Repository) MarkAsRead(ctx context.Context, convID string, userID string, lastReadMsgID string) error {
	sql := `
		UPDATE conversation_messages 
		SET is_read = true 
		WHERE conversation_id = @conv_id 
		  AND sender_id != @user_id 
		  AND is_read = false
		  AND id <= @last_msg_id
	`

	args := pgx.NamedArgs{
		"conv_id":     convID,
		"user_id":     userID,
		"last_msg_id": lastReadMsgID,
	}

	q := database.Query{
		Name: "message_repository.MarkAsRead",
		Sql:  sql,
	}

	if _, err := r.db.DB().ExecContext(ctx, q, args); err != nil {
		return executeSQLError(err)
	}

	return nil
}

func (r *Repository) ListByConversationID(ctx context.Context, convID string, limit int, cursor string) ([]entity.Message, error) {
	builder := r.qb.Select(
		idColumn,
		conversationIDColumn,
		senderIDColumn,
		contentColumn,
		isReadColumn,
		createdAtColumn,
	).
		From(tableName).
		Where(sq.Eq{conversationIDColumn: convID})

	if cursor != "" {
		builder = builder.Where(sq.Lt{idColumn: cursor})
	}

	sql, args, err := builder.OrderBy(idColumn + " DESC").Limit(uint64(limit)).ToSql()
	if err != nil {
		return nil, buildSQLError(err)
	}

	q := database.Query{
		Name: "message_repository.ListByConversationID",
		Sql:  sql,
	}

	rows, err := r.db.DB().QueryContext(ctx, q, args...)
	if err != nil {
		return nil, executeSQLError(err)
	}
	defer rows.Close()

	var msgs Messages
	if err := pgxscan.ScanAll(&msgs, rows); err != nil {
		return nil, scanRowsError(err)
	}

	return msgs.ToEntities(), nil
}
