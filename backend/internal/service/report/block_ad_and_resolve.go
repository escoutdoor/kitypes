package report

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) BlockAdAndResolveReport(ctx context.Context, reportID string, adID string, adminNotes *string) error {
	return s.tx.ReadCommitted(ctx, func(txCtx context.Context) error {
		if err := s.adRepo.UpdateStatus(txCtx, entity.UpdateAdStatusInput{
			ID:     adID,
			Status: entity.AdStatusBlocked,
		}); err != nil {
			return errwrap.Wrap("block ad in transaction", err)
		}

		if err := s.repo.UpdateStatus(txCtx, entity.UpdateReportStatusInput{
			ReportID:   reportID,
			Status:     entity.ReportStatusResolved,
			AdminNotes: adminNotes,
		}); err != nil {
			return errwrap.Wrap("resolve report in transaction", err)
		}

		return nil
	})
}
