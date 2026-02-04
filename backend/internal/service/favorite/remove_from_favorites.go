package favorite

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) Remove(ctx context.Context, userID string, adID string) error {
	if err := s.favoriteRepo.Delete(ctx, userID, adID); err != nil {
		return errwrap.Wrap("remove favorite ad in repository", err)
	}

	return nil
}
