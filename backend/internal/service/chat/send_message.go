package chat

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/apperror/code"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
	"github.com/escoutdoor/kitypes/backend/pkg/logger"
)

func (s *Service) SendMessage(ctx context.Context, in entity.Message, adID string) error {
	if len(in.ConversationID) == 0 && len(adID) == 0 {
		return fmt.Errorf("conversationId or adId should be passed")
	}

	var convID string
	var receiverID string

	if in.ConversationID != "" {
		conv, err := s.conversationRepo.GetByID(ctx, in.ConversationID)
		if err != nil {
			return errwrap.Wrap("get conversation by id", err)
		}

		if conv.OwnerID != in.SenderID && conv.AdopterID != in.SenderID {
			return apperror.ConversationAccessDenied
		}

		convID = conv.ID
		receiverID = s.getReceiver(conv, in.SenderID)
	} else if adID != "" {
		conv, err := s.conversationRepo.GetByAdID(ctx, in.SenderID, adID)
		if err == nil {
			convID = conv.ID
			receiverID = s.getReceiver(conv, in.SenderID)
		} else {
			appErr := new(apperror.Error)
			if errors.As(err, &appErr) && appErr.Code == code.NotFound {
				ad, err := s.adRepo.Get(ctx, adID)
				if err != nil {
					return errwrap.Wrap("get ad", err)
				}

				if ad.AuthorID == in.SenderID {
					return apperror.ErrCannotMessageYourself
				}

				newConv := entity.Conversation{
					AdID:      adID,
					OwnerID:   ad.AuthorID,
					AdopterID: in.SenderID,
				}
				newID, err := s.conversationRepo.Create(ctx, newConv)
				if err != nil {
					return errwrap.Wrap("create conversation", err)
				}

				convID = newID
				receiverID = ad.AuthorID
			} else {
				return errwrap.Wrap("get conversattion by ad id", err)
			}
		}
	}

	in.ConversationID = convID

	if err := s.messageRepo.Create(ctx, in); err != nil {
		return errwrap.Wrap("create message", err)
	}

	in.CreatedAt = time.Now()
	msgBytes, err := json.Marshal(in)
	if err != nil {
		return errwrap.Wrap("marshal message", err)
	}

	event := entity.MessageEvent{
		ReceiverID: receiverID,
		Content:    json.RawMessage(msgBytes),
	}

	payload, err := json.Marshal(event)
	if err != nil {
		return errwrap.Wrap("marshal message event", err)
	}

	if err := s.redisClient.Publish(ctx, "chat", payload).Err(); err != nil {
		logger.ErrorKV(ctx, "redis client push message", "err", err.Error())
	}
	return nil
}

func (s *Service) getReceiver(conv entity.Conversation, senderID string) string {
	if conv.OwnerID == senderID {
		return conv.AdopterID
	}

	return conv.OwnerID
}
