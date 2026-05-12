package report

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) BanUserAndResolveReport(ctx context.Context, reportID string, targetUserID string, adminNotes *string) error {
	if txErr := s.tx.ReadCommitted(ctx, func(txCtx context.Context) error {
		if err := s.userRepo.Ban(txCtx, targetUserID); err != nil {
			return errwrap.Wrap("ban user in repo", err)
		}

		if err := s.adRepo.BlockAllByUserID(txCtx, targetUserID); err != nil {
			return errwrap.Wrap("block all user ads in repo", err)
		}

		if err := s.repo.UpdateStatus(txCtx, entity.UpdateReportStatusInput{
			ReportID:   reportID,
			Status:     entity.ReportStatusResolved,
			AdminNotes: adminNotes,
		}); err != nil {
			return errwrap.Wrap("resolve report in repo", err)
		}

		return nil
	}); txErr != nil {
		return txErr
	}

	return nil
}
