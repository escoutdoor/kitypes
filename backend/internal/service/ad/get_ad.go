package ad

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) Get(ctx context.Context, adID string) (entity.Ad, error) {
	ad, err := s.adRepo.Get(ctx, adID)
	if err != nil {
		return entity.Ad{}, errwrap.Wrap("get ad from repo", err)
	}

	return ad, nil
}
