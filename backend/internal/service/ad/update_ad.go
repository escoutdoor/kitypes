package ad

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) UpdateAd(ctx context.Context, in UpdateAdInput) (entity.Ad, error) {
	var ad entity.Ad

	if txErr := s.txManager.ReadCommited(ctx, func(ctx context.Context) error {
		var err error
		if err := s.adRepo.UpdateAd(ctx, in); err != nil {
			return errwrap.Wrap("update ad in repo", err)
		}

		ad, err = s.adRepo.GetAd(ctx, in.ID)
		if err != nil {
			return errwrap.Wrap("get just updated ad from repo", err)
		}

		return nil
	}); txErr != nil {
		return entity.Ad{}, txErr
	}

	return ad, nil
}
