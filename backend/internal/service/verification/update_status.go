package verification

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) UpdateStatus(ctx context.Context, in entity.UpdateVerificationStatusInput) error {
	if txErr := s.txManager.ReadCommitted(ctx, func(txCtx context.Context) error {
		req, err := s.repo.GetVerificationRequestForUpdate(txCtx, in.RequestID)
		if err != nil {
			return errwrap.Wrap("get request for update", err)
		}

		if req.Status != entity.VerificationStatusPending {
			return apperror.ErrRequestAlreadyProcessed
		}

		if in.Status == entity.VerificationStatusApproved {
			if err := s.userRepo.UpdateRole(txCtx, req.UserID, req.RequestedRole); err != nil {
				return errwrap.Wrap("update user role", err)
			}
		}

		if err := s.repo.UpdateVerificationRequest(txCtx, in); err != nil {
			return errwrap.Wrap("update request status", err)
		}

		return nil
	}); txErr != nil {
		return txErr
	}

	return nil
}
