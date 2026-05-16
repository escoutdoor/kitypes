package user

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) Ban(ctx context.Context, userID string) error {
	if err := s.userRepo.Ban(ctx, userID); err != nil {
		return errwrap.Wrap("ban user in repo", err)
	}

	return nil
}
