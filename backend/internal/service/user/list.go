package user

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) List(ctx context.Context, in entity.ListUsersInput) (entity.ListUsersOutput, error) {
	out, err := s.userRepo.List(ctx, in)
	if err != nil {
		return entity.ListUsersOutput{}, errwrap.Wrap("list users from repo", err)
	}

	return out, nil
}
