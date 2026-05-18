package auth

import (
	"context"
	"fmt"
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/template"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
	"github.com/escoutdoor/kitypes/backend/pkg/logger"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

const (
	resetPasswordEmailSubject = "Відновлення пароля | KityPes"

	maxEmailsPerHour = 3 // max 3 emails per hour
	rateLimitWindow  = time.Hour
)

func (s *Service) ForgotPassword(ctx context.Context, email string) error {
	limitKey := fmt.Sprintf("forgot_password:rate:%s", email)
	windowSeconds := int(rateLimitWindow.Seconds())

	count, err := rateLimitScript.Run(ctx, s.redis, []string{limitKey}, windowSeconds).Int()
	if err != nil {
		return errwrap.Wrap("execute rate limit script", err)
	}
	if count > maxEmailsPerHour {
		return apperror.ErrRateLimitExceeded
	}

	user, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		logger.ErrorKV(ctx, "something HAPPENNED THERE", "error", err)
		if apperror.IsNotFound(err) {
			return nil
		}

		return errwrap.Wrap("get user by email", err)
	}
	if user.IsBanned {
		return nil
	}

	logger.Info(ctx, "AFTER EMAIL")

	token := uuid.New().String()
	redisKey := generateRedisResetKey(token)

	if err := s.redis.SetEx(ctx, redisKey, user.ID, resetTokenTTL).Err(); err != nil {
		return errwrap.Wrap("set reset token in redis", err)
	}

	logger.Info(ctx, "PREPARING FOR SENDING>>>")
	resetLink := fmt.Sprintf("%s/reset-password?token=%s", s.frontendURL, token)
	htmlBody, err := template.RenderResetPassword(template.ResetPasswordData{
		ResetLink: resetLink,
	})
	if err != nil {
		return errwrap.Wrap("render reset password template", err)
	}

	logger.Info(ctx, "SENDING>>>")
	if err := s.sesClient.SendEmail(ctx, user.Email, resetPasswordEmailSubject, htmlBody); err != nil {
		return errwrap.Wrap("send reset email", err)
	}

	return nil
}

var rateLimitScript = redis.NewScript(`
	local current = redis.call("INCR", KEYS[1])
	if current == 1 then
		redis.call("EXPIRE", KEYS[1], ARGV[1])
	end
	return current
`)
