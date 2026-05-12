package report

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) GetByID(ctx context.Context, reportID string) (entity.EnrichedReport, error) {
	out, err := s.repo.GetByID(ctx, reportID)
	if err != nil {
		return entity.EnrichedReport{}, errwrap.Wrap("get report by id from repo", err)
	}
	return out, nil
}
