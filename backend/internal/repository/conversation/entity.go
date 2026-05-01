package conversation

import (
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

type Conversation struct {
	ID   string `db:"id"`
	AdID string `db:"ad_id"`

	OwnerID   string `db:"owner_id"`
	AdopterID string `db:"adopter_id"`

	CreatedAt time.Time `db:"created_at"`
}

func (c *Conversation) ToEntity() entity.Conversation {
	return entity.Conversation{
		ID:        c.ID,
		AdID:      c.AdID,
		OwnerID:   c.OwnerID,
		AdopterID: c.AdopterID,
		CreatedAt: c.CreatedAt,
	}
}

type ConversationWithLastMessage struct {
	ID        string    `db:"id"`
	AdID      string    `db:"ad_id"`
	OwnerID   string    `db:"owner_id"`
	AdopterID string    `db:"adopter_id"`
	CreatedAt time.Time `db:"created_at"`

	LastMessageID        *string    `db:"last_msg_id"`
	LastMessageSenderID  *string    `db:"last_msg_sender_id"`
	LastMessageContent   *string    `db:"last_msg_content"`
	LastMessageIsRead    *bool      `db:"last_msg_is_read"`
	LastMessageCreatedAt *time.Time `db:"last_msg_created_at"`
}

func (c ConversationWithLastMessage) ToEntity() (entity.Conversation, *entity.Message) {
	conv := entity.Conversation{
		ID:        c.ID,
		AdID:      c.AdID,
		OwnerID:   c.OwnerID,
		AdopterID: c.AdopterID,
		CreatedAt: c.CreatedAt,
	}

	var msg *entity.Message
	if c.LastMessageID != nil {
		msg = &entity.Message{
			ID:             *c.LastMessageID,
			ConversationID: c.ID,
			SenderID:       *c.LastMessageSenderID,
			Content:        *c.LastMessageContent,
			IsRead:         *c.LastMessageIsRead,
			CreatedAt:      *c.LastMessageCreatedAt,
		}
	}

	return conv, msg
}

type ConversationsWithLastMessage []ConversationWithLastMessage

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
