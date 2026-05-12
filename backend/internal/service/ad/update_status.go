package ad

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) UpdateStatus(ctx context.Context, in entity.UpdateAdStatusInput) error {
	if err := s.adRepo.UpdateStatus(ctx, in); err != nil {
		return errwrap.Wrap("update ad status in db", err)
	}

	return nil
}
