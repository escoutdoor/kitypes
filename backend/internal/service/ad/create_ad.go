package ad

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) CreateAd(ctx context.Context, in CreateAdInput) (entity.Ad, error) {
	var ad entity.Ad
	in.Status = entity.AdStatusOpened

	if txErr := s.txManager.ReadCommited(ctx, func(ctx context.Context) error {
		adID, err := s.adRepo.CreateAd(ctx, in)
		if err != nil {
			return errwrap.Wrap("create ad in repo", err)
		}

		ad, err = s.adRepo.GetAd(ctx, adID)
		if err != nil {
			return errwrap.Wrap("get just created ad from repo", err)
		}

		return nil
	}); txErr != nil {
		return entity.Ad{}, txErr
	}

	return ad, nil
}
