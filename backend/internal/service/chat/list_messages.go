package chat

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) ListMessages(ctx context.Context, userID, convID string, limit int, cursor string) ([]entity.Message, string, error) {
	conv, err := s.conversationRepo.GetByID(ctx, convID)
	if err != nil {
		return nil, "", errwrap.Wrap("get conversation", err)
	}

	if conv.OwnerID != userID && conv.AdopterID != userID {
		return nil, "", apperror.ConversationAccessDenied
	}

	msgs, err := s.messageRepo.ListByConversationID(ctx, convID, limit, cursor)
	if err != nil {
		return nil, "", errwrap.Wrap("list messages from repo", err)
	}

	var nextCursor string
	if len(msgs) == limit {
		next := msgs[len(msgs)-1]
		nextCursor = next.ID
	}

	return msgs, nextCursor, nil
}
