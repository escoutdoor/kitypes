package ad

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) Create(ctx context.Context, in entity.CreateAdInput) (entity.Ad, error) {
	var createdAd entity.Ad

	if txErr := s.txManager.ReadCommitted(ctx, func(txCtx context.Context) error {
		in.Status = entity.AdStatusOpened

		adID, err := s.adRepo.Create(txCtx, in)
		if err != nil {
			return errwrap.Wrap("create ad in repo", err)
		}

		if err := s.adRepo.AddImages(txCtx, adID, in.ImageKeys); err != nil {
			return errwrap.Wrap("add images to ad in repo", err)
		}

		createdAd, err = s.adRepo.Get(txCtx, adID, &in.UserID)
		if err != nil {
			return errwrap.Wrap("get created ad from repo", err)
		}

		return nil
	}); txErr != nil {
		return entity.Ad{}, txErr
	}

	return createdAd, nil
}

func (s *Service) BuildPublicURL(key string) string {
	return s.s3Client.BuildPublicURL(key)
}
