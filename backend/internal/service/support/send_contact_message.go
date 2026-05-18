package support

import (
	"context"
	"fmt"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/template"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) SendContactMessage(ctx context.Context, in entity.SendContactInput) error {
	limitKey := "support:rate:ip:" + in.IPAddress
	if in.UserID != nil {
		limitKey = "support:rate:user:" + *in.UserID
	}

	windowSeconds := int(rateLimitWindow.Seconds())
	count, err := rateLimitScript.Run(ctx, s.redis, []string{limitKey}, windowSeconds).Int()
	if err != nil {
		return errwrap.Wrap("execute support rate limit script", err)
	}
	if count > maxSupportRequestsPerHour {
		return apperror.ErrRateLimitExceeded
	}

	userIDStr := ""
	if in.UserID != nil {
		userIDStr = *in.UserID
	}

	htmlBody, err := template.RenderSupportRequest(template.SupportRequestData{
		Subject:   in.Subject,
		UserEmail: in.Email,
		UserID:    userIDStr,
		Message:   in.Message,
	})
	if err != nil {
		return errwrap.Wrap("render support template", err)
	}

	emailSubject := generateEmailSubject(in.Subject)
	if err := s.sesClient.SendEmail(ctx, s.supportEmail, emailSubject, htmlBody); err != nil {
		return errwrap.Wrap("send support email via ses", err)
	}

	return nil
}

func generateEmailSubject(subject string) string {
	return fmt.Sprintf("Підтримка: %s", subject)
}
