package auth

import (
	"context"
	"errors"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/apperror/code"
	"github.com/escoutdoor/kitypes/backend/internal/util/hasher"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) Login(ctx context.Context, in LoginInput) (Tokens, error) {
	user, err := s.userRepo.GetUserByEmail(ctx, in.Email)
	if err != nil {
		appErr := new(apperror.Error)
		if errors.As(err, &appErr) && appErr.Code == code.UserNotFound {
			return Tokens{}, apperror.ErrIncorrectCreadentials
		}

		return Tokens{}, errwrap.Wrap("get user by email from repository", err)
	}

	if match := hasher.CompareHashAndPassword(user.Password, in.Password); !match {
		return Tokens{}, apperror.ErrIncorrectCreadentials
	}

	accessToken, err := s.tokenProvider.GenerateAccessToken(user.ID)
	if err != nil {
		return Tokens{}, errwrap.Wrap("generate jwt access token", err)
	}
	refreshToken, err := s.tokenProvider.GenerateRefreshToken(user.ID)
	if err != nil {
		return Tokens{}, errwrap.Wrap("generate jwt refresh token", err)
	}

	return Tokens{AccessToken: accessToken, RefreshToken: refreshToken}, nil
}
