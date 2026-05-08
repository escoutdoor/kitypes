package verification

import (
	"context"
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
	"github.com/escoutdoor/kitypes/backend/pkg/logger"
)

func (s *Service) UpdateStatus(ctx context.Context, in entity.UpdateVerificationStatusInput) error {
	var keysToDelete []string

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

		if err := s.repo.DeleteDocuments(txCtx, in.RequestID); err != nil {
			return errwrap.Wrap("delete documents from db", err)
		}

		keysToDelete = req.DocumentKeys
		return nil
	}); txErr != nil {
		return txErr
	}

	if len(keysToDelete) > 0 {
		go func(keys []string) {
			bgCtx, cancel := context.WithTimeout(context.WithoutCancel(ctx), 15*time.Second)
			defer cancel()

			if err := s.s3Client.DeleteFiles(bgCtx, keys); err != nil {
				logger.ErrorKV(bgCtx, "failed to delete verification documents from s3", "error", err, "keys", keys)
			}
		}(keysToDelete)
	}

	return nil
}
