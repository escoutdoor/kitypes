package message

import (
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

type Message struct {
	ID             string `db:"id"`
	ConversationID string `db:"conversation_id"`
	SenderID       string `db:"sender_id"`

	Content string `db:"content"`

	IsRead    bool      `db:"is_read"`
	CreatedAt time.Time `db:"created_at"`
}

func (e Message) ToEntity() entity.Message {
	return entity.Message{
		ID:             e.ID,
		ConversationID: e.ConversationID,
		SenderID:       e.SenderID,

		Content: e.Content,

		IsRead:    e.IsRead,
		CreatedAt: e.CreatedAt,
	}
}

type Messages []Message

func (e Messages) ToEntities() []entity.Message {
	list := make([]entity.Message, 0, len(e))
	for _, m := range e {
		list = append(list, m.ToEntity())
	}

	return list
}

func buildSQLError(err error) error {
	return errwrap.Wrap("build sql", err)
}

func executeSQLError(err error) error {
	return errwrap.Wrap("execute sql", err)
}

func scanRowError(err error) error {
	return errwrap.Wrap("scan row", err)
}

func scanRowsError(err error) error {
	return errwrap.Wrap("scan rows", err)
}
