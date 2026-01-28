package user

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
)

type userRepository interface {
	GetUserByEmail(ctx context.Context, email string) (entity.User, error)
	GetUserByID(ctx context.Context, userID string) (entity.User, error)
}

type Service struct {
	userRepo userRepository
}

func New(userRepo userRepository) *Service {
	return &Service{
		userRepo: userRepo,
	}
}
