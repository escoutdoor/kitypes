package auth

import (
	"context"
	"fmt"
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/token"
	"github.com/redis/go-redis/v9"
)

const (
	resetTokenTTL = 15 * time.Minute
)

type userRepository interface {
	Create(ctx context.Context, in entity.CreateUserInput) (string, error)
	UpdatePassword(ctx context.Context, userID string, password string) error

	GetByEmail(ctx context.Context, email string) (entity.User, error)
	GetByID(ctx context.Context, userID string) (entity.User, error)
}

type tokenProvider interface {
	ValidateAccessToken(accessToken string) (token.TokenPayload, error)
	ValidateRefreshToken(refreshToken string) (token.TokenPayload, error)

	GenerateAccessToken(userID string, role entity.UserRole) (string, error)
	GenerateRefreshToken(userID string, role entity.UserRole) (string, error)
}

type sesClient interface {
	SendEmail(ctx context.Context, to, subject, htmlBody string) error
}

type Service struct {
	userRepo      userRepository
	tokenProvider tokenProvider

	redis       *redis.Client
	sesClient   sesClient
	frontendURL string
}

func New(
	userRepo userRepository,
	tokenProvider tokenProvider,

	redis *redis.Client,
	sesClient sesClient,
	frontendURL string,
) *Service {
	return &Service{
		userRepo:      userRepo,
		tokenProvider: tokenProvider,
		redis:         redis,
		sesClient:     sesClient,
		frontendURL:   frontendURL,
	}
}

func generateRedisResetKey(token string) string {
	return fmt.Sprintf("reset_token:%s", token)
}
