package user

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/hasher"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) UpdatePassword(ctx context.Context, in entity.UpdateUserPasswordInput) error {
	user, err := s.userRepo.GetByID(ctx, in.ID)
	if err != nil {
		return errwrap.Wrap("get user by id from repository", err)
	}
	if match := hasher.CompareHashAndPassword(user.Password, in.OldPassword); !match {
		return apperror.ErrIncorrectPassword
	}

	hashPw, err := hasher.HashPassword(in.NewPassword)
	if err != nil {
		return errwrap.Wrap("hash password", err)
	}
	if err := s.userRepo.UpdatePassword(ctx, in.ID, hashPw); err != nil {
		return errwrap.Wrap("update password in repository", err)
	}

	return nil
}
