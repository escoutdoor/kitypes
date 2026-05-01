package conversation

import (
	"context"
	"errors"
	"strings"

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
	tableName = "conversations"

	idColumn = "id"

	adIDColumn      = "ad_id"
	ownerIDColumn   = "owner_id"
	adopterIDColumn = "adopter_id"

	createdAtColumn = "created_at"
)

const (
	constraintConversationsAdIDAdopterIDKey = "conversations_ad_id_adopter_id_key"
	constraintConversationsAdIDFKey         = "conversations_ad_id_fkey"
	constraintConversationsAdopterIDFKey    = "conversations_adopter_id_fkey"
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
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			switch pgErr.Code {
			case pgerrcode.UniqueViolation:
				if pgErr.ConstraintName == constraintConversationsAdIDAdopterIDKey {
					return "", apperror.ErrConversationAlreadyExists
				}
			case pgerrcode.ForeignKeyViolation:
				switch pgErr.ConstraintName {
				case constraintConversationsAdIDFKey:
					return "", apperror.AdNotFoundID(in.AdID)
				case constraintConversationsAdopterIDFKey:
					return "", apperror.UserNotFoundID(in.AdopterID)
				}
			}
		}
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

func (r *Repository) ListByUserID(ctx context.Context, userID string, limit int, cursor string) ([]entity.Conversation, map[string]*entity.Message, error) {
	sql := `
		SELECT 
			c.id AS id, 
			c.ad_id AS ad_id, 
			c.owner_id AS owner_id, 
			c.adopter_id AS adopter_id, 
			c.created_at AS created_at,
			m.id AS last_msg_id, 
			m.sender_id AS last_msg_sender_id, 
			m.content AS last_msg_content, 
			m.is_read AS last_msg_is_read, 
			m.created_at AS last_msg_created_at
		FROM conversations c
		LEFT JOIN LATERAL (
			SELECT id, sender_id, content, is_read, created_at
			FROM conversation_messages
			WHERE conversation_id = c.id
			ORDER BY id DESC
			LIMIT 1
		) m ON true
	`

	args := pgx.NamedArgs{}
	conditions := make([]string, 0, 2)

	args["user_id"] = userID
	conditions = append(conditions, "(c.owner_id=@user_id OR c.adopter_id=@user_id)")

	if cursor != "" {
		args["cursor"] = cursor
		conditions = append(conditions, "COALESCE(m.id, c.id) < @cursor")
	}

	if len(conditions) > 0 {
		sql += " WHERE " + strings.Join(conditions, " AND ")
	}

	sql += " ORDER BY COALESCE(m.id, c.id) DESC LIMIT @limit"
	args["limit"] = limit

	q := database.Query{
		Name: "conversation_repository.ListByUserID",
		Sql:  sql,
	}

	rows, err := r.db.DB().QueryContext(ctx, q, args)
	if err != nil {
		return nil, nil, executeSQLError(err)
	}
	defer rows.Close()

	var dbConvs ConversationsWithLastMessage
	if err := pgxscan.ScanAll(&dbConvs, rows); err != nil {
		return nil, nil, scanRowsError(err)
	}

	convs := make([]entity.Conversation, 0, len(dbConvs))
	msgsMap := make(map[string]*entity.Message, len(dbConvs))

	for _, dbConv := range dbConvs {
		c, m := dbConv.ToEntity()
		convs = append(convs, c)

		if m != nil {
			msgsMap[c.ID] = m
		}
	}

	return convs, msgsMap, nil
}
