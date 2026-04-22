package favorite

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) List(ctx context.Context, in entity.ListFavoritesInput) (entity.ListFavoritesOutput, error) {
	favOutput, err := s.favoriteRepo.List(ctx, in)
	if err != nil {
		return entity.ListFavoritesOutput{}, errwrap.Wrap("get favorites list", err)
	}
	if len(favOutput.Favorites) == 0 {
		return favOutput, nil
	}

	adIDs := make([]string, len(favOutput.Favorites))
	for i, fav := range favOutput.Favorites {
		adIDs[i] = fav.Ad.ID
	}

	adsOutput, err := s.adRepo.List(ctx, entity.ListAdsInput{
		AdIDs: adIDs,
		Limit: len(adIDs),
	})
	if err != nil {
		return entity.ListFavoritesOutput{}, errwrap.Wrap("get ads for favorites", err)
	}

	adMap := make(map[string]entity.Ad, len(adsOutput.Ads))
	for _, ad := range adsOutput.Ads {
		adMap[ad.ID] = ad
	}

	var merged []entity.Favorite
	for _, fav := range favOutput.Favorites {
		if fullAd, exists := adMap[fav.Ad.ID]; exists {
			fav.Ad = fullAd
			merged = append(merged, fav)
		}
	}

	favOutput.Favorites = merged

	return favOutput, nil
}
