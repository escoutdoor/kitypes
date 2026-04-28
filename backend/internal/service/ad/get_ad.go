package ad

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) Get(ctx context.Context, adID string, viewerID *string) (entity.EnrichedAd, error) {
	ad, err := s.adRepo.Get(ctx, adID, viewerID)
	if err != nil {
		return entity.EnrichedAd{}, errwrap.Wrap("get ad from repo", err)
	}

	u, err := s.userRepo.GetByID(ctx, ad.AuthorID)
	if err != nil {
		return entity.EnrichedAd{}, errwrap.Wrap("get user from repo", err)
	}

	enrichedAd := entity.EnrichedAd{
		Ad:              ad,
		AuthorName:      u.FirstName + " " + u.LastName,
		AuthorAvatarKey: u.AvatarKey,
	}

	return enrichedAd, nil
}
