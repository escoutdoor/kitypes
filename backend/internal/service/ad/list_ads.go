package ad

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) List(ctx context.Context, in entity.ListAdsInput) (entity.ListAdsOutput, error) {
	resp, err := s.adRepo.List(ctx, in)
	if err != nil {
		return entity.ListAdsOutput{}, errwrap.Wrap("get list of ads from repo", err)
	}

	return resp, nil
}
