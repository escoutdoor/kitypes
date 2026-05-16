package user

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) GetPublicUserByID(ctx context.Context, userID string) (entity.User, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return entity.User{}, errwrap.Wrap("get user by id from repository", err)
	}

	if user.IsBanned {
		return entity.User{}, apperror.UserNotFoundID(userID)
	}

	return user, nil
}
