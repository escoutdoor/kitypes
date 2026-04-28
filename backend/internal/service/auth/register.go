package auth

import (
	"context"
	"errors"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/apperror/code"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/hasher"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) Register(ctx context.Context, in entity.CreateUserInput) (entity.Tokens, error) {
	user, err := s.userRepo.GetByEmail(ctx, in.Email)
	if err != nil {
		appErr := new(apperror.Error)
		if errors.As(err, &appErr) {
			if appErr.Code != code.NotFound {
				return entity.Tokens{}, errwrap.Wrap("get user by email from repository", err)
			}
		} else {
			return entity.Tokens{}, errwrap.Wrap("get user by email from repository", err)
		}
	}
	if user.Email != "" {
		return entity.Tokens{}, apperror.UserEmailAlreadyExists(in.Email)
	}

	pw, err := hasher.HashPassword(in.Password)
	if err != nil {
		return entity.Tokens{}, errwrap.Wrap("hash user password", err)
	}
	in.Password = pw

	userID, err := s.userRepo.Create(ctx, in)
	if err != nil {
		return entity.Tokens{}, errwrap.Wrap("create user in repository", err)
	}

	accessToken, err := s.tokenProvider.GenerateAccessToken(userID)
	if err != nil {
		return entity.Tokens{}, errwrap.Wrap("generate jwt access token", err)
	}
	refreshToken, err := s.tokenProvider.GenerateRefreshToken(userID)
	if err != nil {
		return entity.Tokens{}, errwrap.Wrap("generate jwt refresh token", err)
	}

	return entity.Tokens{AccessToken: accessToken, RefreshToken: refreshToken}, nil
}
