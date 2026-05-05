package user

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/hasher"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) UpdateEmail(ctx context.Context, in entity.UpdateUserEmailInput) error {
	user, err := s.userRepo.GetByID(ctx, in.ID)
	if err != nil {
		return errwrap.Wrap("get user by id from repository", err)
	}

	if match := hasher.CompareHashAndPassword(user.Password, in.Password); !match {
		return apperror.ErrIncorrectPassword
	}

	if err := s.userRepo.UpdateEmail(ctx, in.ID, in.NewEmail); err != nil {
		return errwrap.Wrap("update user email in repository", err)
	}

	return nil
}
