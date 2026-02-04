package favorite

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) Add(ctx context.Context, userID string, adID string) error {
	if err := s.favoriteRepo.Create(ctx, userID, adID); err != nil {
		return errwrap.Wrap("create favorite ad in repository", err)
	}

	return nil
}
