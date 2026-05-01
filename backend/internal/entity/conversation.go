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

type EnrichedConversation struct {
	ID string

	Ad          Ad
	OtherUser   User
	LastMessage *Message

	CreatedAt time.Time
}

type Message struct {
	ID             string
	ConversationID string
	SenderID       string

	Content string

	IsRead    bool
	CreatedAt time.Time
}

type EventType string

const (
	EventTypeMessage EventType = "message"
	EventTypeRead    EventType = "read"
)

type EventEnvelope struct {
	Type       EventType       `json:"type"`
	ReceiverID string          `json:"receiverId"`
	Payload    json.RawMessage `json:"payload"`
}

type ReadEvent struct {
	ConversationID    string `json:"conversationId"`
	LastReadMessageID string `json:"lastReadMessageId"`
	ReaderID          string `json:"readerId"`
}
