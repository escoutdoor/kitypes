package auth

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) RefreshToken(ctx context.Context, refreshToken string) (entity.Tokens, error) {
	tokenPayload, err := s.tokenProvider.ValidateRefreshToken(refreshToken)
	if err != nil {
		return entity.Tokens{}, errwrap.Wrap("validate refresh token", err)
	}

	user, err := s.userRepo.GetByID(ctx, tokenPayload.UserID)
	if err != nil {
		return entity.Tokens{}, errwrap.Wrap("get user by id from repository", err)
	}
	if user.IsBanned {
		return entity.Tokens{}, apperror.ErrUserBanned
	}

	accessToken, err := s.tokenProvider.GenerateAccessToken(tokenPayload.UserID, user.Role)
	if err != nil {
		return entity.Tokens{}, errwrap.Wrap("generate jwt access token", err)
	}
	newRefreshToken, err := s.tokenProvider.GenerateRefreshToken(tokenPayload.UserID, user.Role)
	if err != nil {
		return entity.Tokens{}, errwrap.Wrap("generate jwt refresh token", err)
	}

	return entity.Tokens{AccessToken: accessToken, RefreshToken: newRefreshToken}, nil
}
