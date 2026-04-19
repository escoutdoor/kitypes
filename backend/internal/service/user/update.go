package user

import (
	"context"
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
	"github.com/escoutdoor/kitypes/backend/pkg/logger"
)

func (s *Service) Update(ctx context.Context, in entity.UpdateUserInput) (entity.User, error) {
	user, err := s.userRepo.GetByID(ctx, in.ID)
	if err != nil {
		return entity.User{}, errwrap.Wrap("get user by id from repository", err)
	}

	updatedUser, err := s.userRepo.Update(ctx, in)
	if err != nil {
		return entity.User{}, errwrap.Wrap("update user in user repository", err)
	}

	if in.AvatarKey != nil && user.AvatarKey != nil && *in.AvatarKey != *user.AvatarKey {
		go s.deleteAvatar(*user.AvatarKey)
	}

	return updatedUser, nil
}

func (s *Service) deleteAvatar(key string) error {
	bgCtx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	if err := s.s3Client.DeleteFiles(bgCtx, []string{key}); err != nil {
		logger.ErrorKV(bgCtx, "failed to delete avatar",
			"avatar_key: ", key,
			"error: ", err,
		)
	}
	return nil
}
