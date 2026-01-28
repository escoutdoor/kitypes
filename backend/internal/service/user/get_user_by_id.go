package user

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) GetUserByID(ctx context.Context, userID string) (entity.User, error) {
	user, err := s.userRepo.GetUserByID(ctx, userID)
	if err != nil {
		return entity.User{}, errwrap.Wrap("get user by id from repository", err)
	}

	return user, nil
}
