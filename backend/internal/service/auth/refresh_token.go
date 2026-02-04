package auth

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) RefreshToken(ctx context.Context, refreshToken string) (entity.Tokens, error) {
	userID, err := s.tokenProvider.ValidateRefreshToken(refreshToken)
	if err != nil {
		return entity.Tokens{}, errwrap.Wrap("validate refresh token", err)
	}

	if _, err := s.userRepo.GetByID(ctx, userID); err != nil {
		return entity.Tokens{}, errwrap.Wrap("get user by id from repository", err)
	}

	accessToken, err := s.tokenProvider.GenerateAccessToken(userID)
	if err != nil {
		return entity.Tokens{}, errwrap.Wrap("generate jwt access token", err)
	}
	newRefreshToken, err := s.tokenProvider.GenerateRefreshToken(userID)
	if err != nil {
		return entity.Tokens{}, errwrap.Wrap("generate jwt refresh token", err)
	}

	return entity.Tokens{AccessToken: accessToken, RefreshToken: newRefreshToken}, nil
}
