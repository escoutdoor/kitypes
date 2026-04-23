package ad

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) Update(ctx context.Context, in entity.UpdateAdInput) (entity.Ad, error) {
	ad, err := s.adRepo.Get(ctx, in.ID, &in.UserID)
	if err != nil {
		return entity.Ad{}, errwrap.Wrap("get ad from repo", err)
	}
	if ad.AuthorID != in.UserID {
		return entity.Ad{}, apperror.AdAccessDenied
	}

	var keysToDelete []string
	if txErr := s.txManager.ReadCommitted(ctx, func(ctx context.Context) error {
		if len(in.ImageKeys) > 0 {
			oldKeys, err := s.adRepo.GetImageKeys(ctx, in.ID)
			if err != nil {
				return errwrap.Wrap("get ad image keys from repo", err)
			}

			newKeySet := make(map[string]struct{}, len(in.ImageKeys))
			for _, k := range in.ImageKeys {
				newKeySet[k] = struct{}{}
			}
			for _, old := range oldKeys {
				if _, kept := newKeySet[old]; !kept {
					keysToDelete = append(keysToDelete, old)
				}
			}

			if err := s.adRepo.DeleteImages(ctx, in.ID); err != nil {
				return errwrap.Wrap("delete ad image keys in repo", err)
			}
			if err := s.adRepo.AddImages(ctx, in.ID, in.ImageKeys); err != nil {
				return errwrap.Wrap("add new ad image keys in repo", err)
			}
		}
		if err := s.adRepo.Update(ctx, in); err != nil {
			return errwrap.Wrap("update ad in repo", err)
		}
		return nil
	}); txErr != nil {
		return entity.Ad{}, txErr
	}

	if len(keysToDelete) > 0 {
		go s.deleteImages(keysToDelete)
	}

	updatedAd, err := s.adRepo.Get(ctx, in.ID, &in.UserID)
	if err != nil {
		return entity.Ad{}, errwrap.Wrap("get updated ad from repo", err)
	}
	return updatedAd, nil
}
