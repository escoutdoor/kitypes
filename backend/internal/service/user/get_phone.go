package user

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) GetUserPhone(ctx context.Context, userID string) (string, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return "", errwrap.Wrap("get user by id for phone", err)
	}

	if user.IsBanned {
		return "", apperror.UserNotFoundID(userID)
	}

	return user.PhoneNumber, nil
}
