package ad

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) Update(ctx context.Context, in entity.UpdateAd) (entity.Ad, error) {
	ad, err := s.adRepo.Get(ctx, in.ID)
	if err != nil {
		return entity.Ad{}, errwrap.Wrap("get ad from repo", err)
	}
	if ad.AuthorID != in.UserID {
		return entity.Ad{}, apperror.AdAccessDenied
	}

	updatedAd, err := s.adRepo.Update(ctx, in)
	if err != nil {
		return entity.Ad{}, errwrap.Wrap("update ad in repo", err)
	}

	return updatedAd, nil
}
