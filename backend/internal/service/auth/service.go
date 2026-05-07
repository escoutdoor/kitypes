package auth

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/token"
)

type userRepository interface {
	Create(ctx context.Context, in entity.CreateUserInput) (string, error)
	GetByEmail(ctx context.Context, email string) (entity.User, error)
	GetByID(ctx context.Context, userID string) (entity.User, error)
}

type tokenProvider interface {
	ValidateAccessToken(accessToken string) (token.TokenPayload, error)
	ValidateRefreshToken(refreshToken string) (token.TokenPayload, error)

	GenerateAccessToken(userID string, role entity.UserRole) (string, error)
	GenerateRefreshToken(userID string, role entity.UserRole) (string, error)
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
