package ad

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) Create(ctx context.Context, in entity.Ad) (entity.Ad, error) {
	in.Status = entity.AdStatusOpened
	adID, err := s.adRepo.Create(ctx, in)
	if err != nil {
		return entity.Ad{}, errwrap.Wrap("create ad in repo", err)
	}

	ad, err := s.adRepo.Get(ctx, adID)
	if err != nil {
		return entity.Ad{}, errwrap.Wrap("get just created ad from repo", err)
	}

	return ad, nil
}
