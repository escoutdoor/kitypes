package chat

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) GetMessage(ctx context.Context, messageID string) (entity.Message, error) {
	msg, err := s.messageRepo.GetByID(ctx, messageID)
	if err != nil {
		return entity.Message{}, errwrap.Wrap("get message by id from repo", err)
	}

	return msg, nil
}
