package entity

import (
	"encoding/json"
	"time"
)

type Conversation struct {
	ID   string
	AdID string

	OwnerID   string
	AdopterID string

	CreatedAt time.Time
}

type Message struct {
	SenderID       string
	ConversationID string

	Content   string
	CreatedAt time.Time
}

type MessageEvent struct {
	ReceiverID string          `json:"receiver_id"`
	Content    json.RawMessage `json:"content"`
}
