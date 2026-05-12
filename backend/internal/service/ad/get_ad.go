package ad

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) Get(ctx context.Context, adID string, viewerID *string, viewerRole *entity.UserRole) (entity.EnrichedAd, error) {
	ad, err := s.adRepo.Get(ctx, adID, viewerID)
	if err != nil {
		return entity.EnrichedAd{}, errwrap.Wrap("get ad from repo", err)
	}

	if ad.Status == entity.AdStatusBlocked {
		isAuthor := viewerID != nil && *viewerID == ad.AuthorID
		isAdmin := viewerRole != nil && *viewerRole == entity.RoleAdmin

		// we can view block reason only if user is owner/admin
		if !isAuthor && !isAdmin {
			return entity.EnrichedAd{}, apperror.AdNotFoundID(adID)
		}

		// view reason if user is owner/admin
		if isAuthor || isAdmin {
			reason, err := s.reportRepo.GetLastResolvedReason(ctx, adID)
			if err == nil && reason != nil {
				ad.BlockReason = reason
			}
		}
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
