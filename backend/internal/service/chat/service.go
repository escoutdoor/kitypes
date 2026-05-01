package chat

import (
	"context"

	"encoding/json"
	"github.com/escoutdoor/kitypes/backend/pkg/logger"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/redis/go-redis/v9"
)

const (
	redisChatChannelName = "chat"
)

type conversationRepository interface {
	Create(ctx context.Context, in entity.Conversation) (string, error)
	GetByID(ctx context.Context, conversationID string) (entity.Conversation, error)
	GetByAdID(ctx context.Context, userID string, adID string) (entity.Conversation, error)
	ListByUserID(ctx context.Context, userID string, limit int, cursor string) ([]entity.Conversation, map[string]*entity.Message, error)
}

type messageRepository interface {
	Create(ctx context.Context, in entity.Message) (string, error)
	ListByConversationID(ctx context.Context, convID string, limit int, cursor string) ([]entity.Message, error)
	MarkAsRead(ctx context.Context, convID string, userID string, lastReadMsgID string) error
}

type adRepository interface {
	Get(ctx context.Context, adID string, viewerID *string) (entity.Ad, error)
	List(ctx context.Context, in entity.ListAdsInput) (entity.ListAdsOutput, error)
}

type userRepository interface {
	ListByIDs(ctx context.Context, userIDs []string) ([]entity.User, error)
}

type s3Client interface {
	BuildPublicURL(key string) string
}

type Service struct {
	conversationRepo conversationRepository
	messageRepo      messageRepository
	adRepo           adRepository
	userRepo         userRepository
	redisClient      *redis.Client

	s3Client s3Client
}

func New(
	conversationRepo conversationRepository,
	messageRepo messageRepository,
	adRepo adRepository,
	userRepo userRepository,
	redisClient *redis.Client,
	s3Client s3Client,
) *Service {
	return &Service{
		conversationRepo: conversationRepo,
		messageRepo:      messageRepo,
		adRepo:           adRepo,
		userRepo:         userRepo,
		redisClient:      redisClient,
		s3Client:         s3Client,
	}
}

func (s *Service) BuildPublicURL(key string) string {
	return s.s3Client.BuildPublicURL(key)
}

func (s *Service) publishMessageEvent(ctx context.Context, receiverID string, msg entity.Message) {
	msgBytes, err := json.Marshal(msg)
	if err != nil {
		logger.ErrorKV(ctx, "marshal message failed", "err", err.Error())
		return
	}

	event := entity.EventEnvelope{
		ReceiverID: receiverID,
		Type:       entity.EventTypeMessage,
		Payload:    msgBytes,
	}

	payload, err := json.Marshal(event)
	if err != nil {
		logger.ErrorKV(ctx, "marshal event envelope (message event) failed", "err", err.Error())
		return
	}

	if err := s.redisClient.Publish(ctx, redisChatChannelName, payload).Err(); err != nil {
		logger.ErrorKV(ctx, "redis client push message event", "err", err.Error())
	}
}

func (s *Service) publishReadEvent(ctx context.Context, receiverID string, convID string, lastReadID string, readerID string) {
	readEvent := entity.ReadEvent{
		ConversationID:    convID,
		LastReadMessageID: lastReadID,
		ReaderID:          readerID,
	}
	readEventBytes, err := json.Marshal(readEvent)
	if err != nil {
		logger.ErrorKV(ctx, "marshal read event failed", "err", err.Error())
		return
	}

	event := entity.EventEnvelope{
		ReceiverID: receiverID,
		Type:       entity.EventTypeRead,
		Payload:    readEventBytes,
	}

	payload, err := json.Marshal(event)
	if err != nil {
		logger.ErrorKV(ctx, "marshal event envelope (read event) failed", "err", err.Error())
		return
	}

	if err := s.redisClient.Publish(ctx, redisChatChannelName, payload).Err(); err != nil {
		logger.ErrorKV(ctx, "redis client push read event message", "err", err.Error())
	}
}

func (s *Service) getReceiver(conv entity.Conversation, senderID string) string {
	if conv.OwnerID == senderID {
		return conv.AdopterID
	}
	return conv.OwnerID
}
