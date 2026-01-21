package ad

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) DeleteAd(ctx context.Context, adID string) error {
	if _, err := s.adRepo.GetAd(ctx, adID); err != nil {
		return errwrap.Wrap("get ad from repo", err)
	}

	if err := s.adRepo.DeleteAd(ctx, adID); err != nil {
		return errwrap.Wrap("delete ad in repo", err)
	}

	return nil
}
