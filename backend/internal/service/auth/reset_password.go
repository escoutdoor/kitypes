package auth

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/util/hasher"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) ResetPassword(ctx context.Context, token string, newPassword string) error {
	redisKey := generateRedisResetKey(token)
	userID, err := s.redis.Get(ctx, redisKey).Result()
	if err != nil {
		return apperror.ErrInvalidOrExpiredResetToken
	}

	hashPw, err := hasher.HashPassword(newPassword)
	if err != nil {
		return errwrap.Wrap("hash new password", err)
	}

	if err := s.userRepo.UpdatePassword(ctx, userID, hashPw); err != nil {
		return errwrap.Wrap("update password in repo", err)
	}
	s.redis.Del(ctx, redisKey)

	return nil
}
