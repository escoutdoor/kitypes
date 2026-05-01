package chat

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) MarkAsRead(ctx context.Context, convID string, userID string, lastReadMsgID string) error {
	conv, err := s.conversationRepo.GetByID(ctx, convID)
	if err != nil {
		return errwrap.Wrap("get conversation", err)
	}

	if conv.OwnerID != userID && conv.AdopterID != userID {
		return apperror.ConversationAccessDenied
	}

	if err := s.messageRepo.MarkAsRead(ctx, convID, userID, lastReadMsgID); err != nil {
		return errwrap.Wrap("mark as read", err)
	}

	switch userID {
	case conv.OwnerID:
		s.publishReadEvent(ctx, conv.AdopterID, convID, lastReadMsgID, conv.OwnerID)
	case conv.AdopterID:
		s.publishReadEvent(ctx, conv.OwnerID, convID, lastReadMsgID, conv.AdopterID)
	}

	return nil
}
