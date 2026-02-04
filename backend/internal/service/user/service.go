package user

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
)

type userRepository interface {
	GetByEmail(ctx context.Context, email string) (entity.User, error)
	GetByID(ctx context.Context, userID string) (entity.User, error)
	Update(ctx context.Context, in entity.UpdateUser) (entity.User, error)
}

type Service struct {
	userRepo userRepository
}

func New(userRepo userRepository) *Service {
	return &Service{
		userRepo: userRepo,
	}
}
