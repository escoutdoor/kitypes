package ad

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) GetPhone(ctx context.Context, adID string) (string, error) {
	ad, err := s.adRepo.Get(ctx, adID, nil)
	if err != nil {
		return "", errwrap.Wrap("get ad for phone", err)
	}
	if ad.Status == entity.AdStatusBlocked {
		return "", apperror.AdNotFoundID(adID)
	}

	user, err := s.userRepo.GetByID(ctx, ad.AuthorID)
	if err != nil {
		return "", errwrap.Wrap("get author for phone", err)
	}

	return user.PhoneNumber, nil
}
