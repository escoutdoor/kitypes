package user

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) Update(ctx context.Context, in entity.UpdateUser) (entity.User, error) {
	_, err := s.userRepo.GetByID(ctx, in.ID)
	if err != nil {
		return entity.User{}, errwrap.Wrap("get user by id from repository", err)
	}

	user, err := s.userRepo.Update(ctx, in)
	if err != nil {
		return entity.User{}, errwrap.Wrap("update user in user repository", err)
	}

	return user, nil
}
