package user

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) Delete(ctx context.Context, userID string) error {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return errwrap.Wrap("get user by id from repository", err)
	}

	if user.AvatarKey != nil {
		if err := s.s3Client.DeleteFiles(ctx, []string{*user.AvatarKey}); err != nil {
			return errwrap.Wrap("delete avatar from storage", err)
		}
	}

	if err := s.userRepo.Delete(ctx, userID); err != nil {
		return errwrap.Wrap("delete user in repository", err)
	}

	return nil
}
