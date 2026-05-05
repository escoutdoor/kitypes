package user

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) DeleteAvatar(ctx context.Context, userID string) error {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return errwrap.Wrap("get user by id from repository", err)
	}
	if user.AvatarKey == nil {
		return nil
	}

	if err := s.s3Client.DeleteFiles(ctx, []string{*user.AvatarKey}); err != nil {
		return errwrap.Wrap("delete avatar by object key", err)
	}

	if err := s.userRepo.DeleteAvatar(ctx, userID); err != nil {
		return errwrap.Wrap("delete avatar in repository", err)
	}

	return nil
}
