package user

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) UpdateRole(ctx context.Context, userID string, role entity.UserRole) error {
	if err := s.userRepo.UpdateRole(ctx, userID, role); err != nil {
		return errwrap.Wrap("update user role in repo", err)
	}

	return nil
}
