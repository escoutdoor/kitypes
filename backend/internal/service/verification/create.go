package verification

import (
	"context"
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

const verificationCooldown = 72 * time.Hour

func (s *Service) Create(ctx context.Context, in entity.CreateVerificationRequestInput) (entity.VerificationRequest, error) {
	if err := s.checkVerificationEligibility(ctx, in); err != nil {
		return entity.VerificationRequest{}, err
	}

	var createdReq entity.VerificationRequest

	if txErr := s.txManager.ReadCommitted(ctx, func(txCtx context.Context) error {
		var err error

		createdReq, err = s.repo.CreateVerificationRequest(txCtx, in)
		if err != nil {
			return errwrap.Wrap("create request in repo", err)
		}

		if err := s.repo.AddDocuments(txCtx, createdReq.ID, in.DocumentKeys); err != nil {
			return errwrap.Wrap("add documents to request", err)
		}

		return nil
	}); txErr != nil {
		return entity.VerificationRequest{}, txErr
	}

	createdReq.DocumentKeys = in.DocumentKeys
	return createdReq, nil
}

func (s *Service) checkVerificationEligibility(ctx context.Context, in entity.CreateVerificationRequestInput) error {
	if in.RequestedRole == entity.RoleAdmin || in.RequestedRole == entity.RoleUser {
		return apperror.ErrInvalidRequestedRole
	}
	if in.CurrentRole == in.RequestedRole {
		return apperror.ErrUserAlreadyVerified
	}

	lastReq, err := s.repo.GetLatestRequestByUserID(ctx, in.UserID)
	if err != nil {
		// first verification request
		if apperror.IsNotFound(err) {
			return nil
		}

		return errwrap.Wrap("get latest request", err)
	}

	// not first verification request check
	switch lastReq.Status {
	case entity.VerificationStatusPending:
		return apperror.ErrVerificationRequestAlreadySent

	case entity.VerificationStatusApproved:
		if lastReq.RequestedRole == in.RequestedRole {
			return apperror.ErrUserAlreadyVerified
		}

	case entity.VerificationStatusRejected:
		if time.Since(lastReq.UpdatedAt) < verificationCooldown {
			return apperror.ErrVerificationCooldown
		}
	}

	return nil
}
