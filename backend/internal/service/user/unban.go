package user

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) Unban(ctx context.Context, userID string) error {
	if err := s.userRepo.Unban(ctx, userID); err != nil {
		return errwrap.Wrap("unban user in repo", err)
	}

	return nil
}
