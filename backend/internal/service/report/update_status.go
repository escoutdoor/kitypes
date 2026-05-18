package report

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) UpdateStatus(ctx context.Context, in entity.UpdateReportStatusInput) error {
	if err := s.repo.UpdateStatus(ctx, in); err != nil {
		return errwrap.Wrap("update report status in db", err)
	}

	if in.SendWarningEmail && in.AdminNotes != nil {
		go s.sendWarningEmailAsync(context.WithoutCancel(ctx), in.ReportID, *in.AdminNotes)
	}
	return nil
}
