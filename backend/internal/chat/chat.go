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

	subs        map[string]map[*Subscriber]struct{}
	redisClient *redis.Client
}

func NewChat(redisClient *redis.Client) *Chat {
	c := &Chat{
		subs:        make(map[string]map[*Subscriber]struct{}),
		redisClient: redisClient,
	}

	return c
}

func (c *Chat) Run(ctx context.Context) {
	s := c.redisClient.Subscribe(ctx, "chat")
	ch := s.Channel()

	for msg := range ch {
		var envelope entity.EventEnvelope
		if err := json.Unmarshal([]byte(msg.Payload), &envelope); err != nil {
			continue
		}

		if subs, ok := c.GetSubs(envelope.ReceiverID); ok {
			for s := range subs {
				s.send([]byte(msg.Payload))
			}
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
	if c.subs[userID] == nil {
		c.subs[userID] = make(map[*Subscriber]struct{})
	}
	c.subs[userID][sub] = struct{}{}

	return sub
}

func (c *Chat) DeleteSub(userID string, sub *Subscriber) {
	c.mu.Lock()
	defer c.mu.Unlock()

	if _, ok := c.subs[userID]; ok {
		delete(c.subs[userID], sub)
		if len(c.subs[userID]) == 0 {
			delete(c.subs, userID)
		}
	}
}

func (c *Chat) GetSubs(userID string) (map[*Subscriber]struct{}, bool) {
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
