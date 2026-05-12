package report

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) List(ctx context.Context, in entity.ListReportsInput) (entity.ListReportsOutput, error) {
	out, err := s.repo.List(ctx, in)
	if err != nil {
		return entity.ListReportsOutput{}, errwrap.Wrap("list reports from repo", err)
	}

	return out, nil
}
