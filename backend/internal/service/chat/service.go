package chat

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/redis/go-redis/v9"
)

type conversationRepository interface {
	Create(ctx context.Context, in entity.Conversation) (string, error)

	GetByID(ctx context.Context, conversationID string) (entity.Conversation, error)
	GetByAdID(ctx context.Context, userID string, adID string) (entity.Conversation, error)
}

type messageRepository interface {
	Create(ctx context.Context, in entity.Message) error
}

type adRepository interface {
	Get(ctx context.Context, adID string) (entity.Ad, error)
}

type Service struct {
	conversationRepo conversationRepository
	messageRepo      messageRepository
	adRepo           adRepository
	redisClient      *redis.Client
}

func New(
	conversationRepo conversationRepository,
	messageRepo messageRepository,
	adRepo adRepository,
	redisClient *redis.Client,
) *Service {
	return &Service{
		conversationRepo: conversationRepo,
		messageRepo:      messageRepo,
		adRepo:           adRepo,
		redisClient:      redisClient,
	}
}
