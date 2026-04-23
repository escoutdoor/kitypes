package ad

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) Delete(ctx context.Context, userID string, adID string) error {
	ad, err := s.adRepo.Get(ctx, adID, nil)
	if err != nil {
		return errwrap.Wrap("get ad from repo", err)
	}
	if ad.AuthorID != userID {
		return apperror.AdAccessDenied
	}

	oldKeys, err := s.adRepo.GetImageKeys(ctx, adID)
	if err != nil {
		return errwrap.Wrap("get old keys for deletion from repo", err)
	}

	if err := s.adRepo.Delete(ctx, adID); err != nil {
		return errwrap.Wrap("delete ad in repo", err)
	}

	if len(oldKeys) > 0 {
		go s.deleteImages(oldKeys)
	}

	return nil
}
