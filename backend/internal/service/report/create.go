package report

import (
	"context"
	"fmt"
	"strings"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) Create(ctx context.Context, in entity.CreateReportInput) error {
	if in.Reason == entity.ReportReasonOther {
		if in.Comment == nil || len(strings.TrimSpace(*in.Comment)) < minCommentLen {
			return apperror.ErrCommentTooShort(minCommentLen)
		}
	}

	limitKey := fmt.Sprintf("report:rate:%s", in.ReporterID)
	windowSeconds := int(rateLimitWindow.Seconds())

	count, err := rateLimitScript.Run(ctx, s.redis, []string{limitKey}, windowSeconds).Int()
	if err != nil {
		return errwrap.Wrap("execute rate limit script", err)
	}
	if count > maxReportsPerHour {
		return apperror.ErrRateLimitExceeded
	}

	if err := s.repo.Create(ctx, in); err != nil {
		return errwrap.Wrap("create report in repo", err)
	}
	return nil
}
