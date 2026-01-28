package auth

import (
	"context"
	"errors"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/apperror/code"
	"github.com/escoutdoor/kitypes/backend/internal/util/hasher"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) Register(ctx context.Context, in CreateUserInput) (Tokens, error) {
	user, err := s.userRepo.GetUserByEmail(ctx, in.Email)
	if err != nil {
		appErr := new(apperror.Error)
		if errors.As(err, &appErr) {
			if appErr.Code != code.UserNotFound {
				return Tokens{}, errwrap.Wrap("get user by email from repository", err)
			}
		} else {
			return Tokens{}, errwrap.Wrap("get user by email from repository", err)
		}
	}
	if user.Email != "" {
		return Tokens{}, apperror.EmailAlreadyExists(in.Email)
	}

	pw, err := hasher.HashPassword(in.Password)
	if err != nil {
		return Tokens{}, errwrap.Wrap("hash user password", err)
	}
	in.Password = pw

	userID, err := s.userRepo.CreateUser(ctx, in)
	if err != nil {
		return Tokens{}, errwrap.Wrap("create user in repository", err)
	}

	accessToken, err := s.tokenProvider.GenerateAccessToken(userID)
	if err != nil {
		return Tokens{}, errwrap.Wrap("generate jwt access token", err)
	}
	refreshToken, err := s.tokenProvider.GenerateRefreshToken(userID)
	if err != nil {
		return Tokens{}, errwrap.Wrap("generate jwt refresh token", err)
	}

	return Tokens{AccessToken: accessToken, RefreshToken: refreshToken}, nil
}
