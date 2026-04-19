package auth

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
)

type userRepository interface {
	Create(ctx context.Context, in entity.CreateUserInput) (string, error)
	GetByEmail(ctx context.Context, email string) (entity.User, error)
	GetByID(ctx context.Context, userID string) (entity.User, error)
}

type tokenProvider interface {
	ValidateAccessToken(accessToken string) (string, error)
	ValidateRefreshToken(refreshToken string) (string, error)

	GenerateAccessToken(userID string) (string, error)
	GenerateRefreshToken(userID string) (string, error)
}

type Service struct {
	userRepo      userRepository
	tokenProvider tokenProvider
}

func New(userRepo userRepository, tokenProvider tokenProvider) *Service {
	return &Service{
		userRepo:      userRepo,
		tokenProvider: tokenProvider,
	}
}
