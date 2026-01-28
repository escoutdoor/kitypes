package auth

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
)

type userRepository interface {
	CreateUser(ctx context.Context, in CreateUserInput) (string, error)
	GetUserByEmail(ctx context.Context, email string) (entity.User, error)
	GetUserByID(ctx context.Context, userID string) (entity.User, error)
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
