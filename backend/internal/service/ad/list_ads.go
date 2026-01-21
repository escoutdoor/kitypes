package ad

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) ListAds(ctx context.Context, in ListAdsInput) (ListAdsOutput, error) {
	ads, total, err := s.adRepo.ListAds(ctx, in)
	if err != nil {
		return ListAdsOutput{}, errwrap.Wrap("get list of ads from repo", err)
	}

	return ListAdsOutput{Ads: ads, Total: total}, nil
}
