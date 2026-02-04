package chat

import (
	"context"
	"encoding/json"
	"sync"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/redis/go-redis/v9"
)

type Chat struct {
	mu sync.RWMutex

	subs        map[string]*Subscriber
	redisClient *redis.Client
}

func NewChat(redisClient *redis.Client) *Chat {
	c := &Chat{
		subs:        make(map[string]*Subscriber),
		redisClient: redisClient,
	}

	return c
}

func (c *Chat) Run(ctx context.Context) {
	s := c.redisClient.Subscribe(ctx, "chat")
	ch := s.Channel()

	for msg := range ch {
		var event entity.MessageEvent
		if err := json.Unmarshal([]byte(msg.Payload), &event); err != nil {
			continue
		}

		sub, ok := c.GetSub(event.ReceiverID)
		if ok {
			sub.send(event.Content)
		}
	}
}

type Subscriber struct {
	Msgs chan []byte
}

func newSub() *Subscriber {
	return &Subscriber{Msgs: make(chan []byte, 16)}
}

func (c *Chat) AddSub(userID string) *Subscriber {
	c.mu.Lock()
	defer c.mu.Unlock()

	sub := newSub()
	c.subs[userID] = sub

	return sub
}

func (c *Chat) DeleteSub(userID string) {
	c.mu.Lock()
	defer c.mu.Unlock()

	delete(c.subs, userID)
}

func (c *Chat) GetSub(userID string) (*Subscriber, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	s, ok := c.subs[userID]
	return s, ok
}

func (s *Subscriber) send(payload []byte) {
	select {
	case s.Msgs <- payload:
	default:
	}
}
