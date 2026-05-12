package chat

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/apperror/code"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) SendMessage(ctx context.Context, in entity.Message, adID string) error {
	if in.ConversationID == "" && adID == "" {
		return fmt.Errorf("conversationId or adId should be passed")
	}

	u, err := s.userRepo.GetByID(ctx, in.SenderID)
	if err != nil {
		return apperror.UserNotFoundID(in.SenderID)
	}
	if u.IsBanned {
		return apperror.ErrUserBanned
	}

	conv, err := s.resolveConversation(ctx, in.SenderID, in.ConversationID, adID)
	if err != nil {
		return err
	}

	in.ConversationID = conv.ID
	in.CreatedAt = time.Now()

	messageID, err := s.messageRepo.Create(ctx, in)
	if err != nil {
		return errwrap.Wrap("create message", err)
	}
	in.ID = messageID

	receiverID := s.getReceiver(conv, in.SenderID)
	s.publishMessageEvent(ctx, receiverID, in)

	return nil
}

func (s *Service) resolveConversation(ctx context.Context, senderID, convID, adID string) (entity.Conversation, error) {
	if convID != "" {
		conv, err := s.conversationRepo.GetByID(ctx, convID)
		if err != nil {
			return entity.Conversation{}, errwrap.Wrap("get conversation by id", err)
		}
		if conv.OwnerID != senderID && conv.AdopterID != senderID {
			return entity.Conversation{}, apperror.ConversationAccessDenied
		}
		return conv, nil
	}

	conv, err := s.conversationRepo.GetByAdID(ctx, senderID, adID)
	if err == nil {
		return conv, nil // chat already exists
	}

	var appErr *apperror.Error
	if !errors.As(err, &appErr) || appErr.Code != code.NotFound {
		return entity.Conversation{}, errwrap.Wrap("get conversation by ad id", err)
	}

	ad, err := s.adRepo.Get(ctx, adID, &senderID)
	if err != nil {
		return entity.Conversation{}, errwrap.Wrap("get ad", err)
	}
	if ad.AuthorID == senderID {
		return entity.Conversation{}, apperror.ErrCannotMessageYourself
	}

	newConv := entity.Conversation{
		AdID:      adID,
		OwnerID:   ad.AuthorID,
		AdopterID: senderID,
	}

	createdID, err := s.conversationRepo.Create(ctx, newConv)
	if err != nil {
		if errors.Is(err, apperror.ErrConversationAlreadyExists) {
			existingConv, getErr := s.conversationRepo.GetByAdID(ctx, senderID, adID)
			if getErr != nil {
				return entity.Conversation{}, errwrap.Wrap("get conversation after race condition", getErr)
			}
			return existingConv, nil
		}
		return entity.Conversation{}, errwrap.Wrap("create conversation", err)
	}

	newConv.ID = createdID
	return newConv, nil
}
