package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	"github.com/labstack/echo/v4"
)

func (h *handler) publish(c echo.Context) error {
	userID, err := httpctx.GetUserID(c)
	if err != nil {
		return err
	}

	req := new(publishRequest)
	if err := h.cv.BindValidate(c, req); err != nil {
		return err
	}

	in := publishRequestToMessage(req, userID)
	ctx := c.Request().Context()

	if err := h.publishLimiter.Wait(ctx); err != nil {
		return err
	}

	if err := h.service.SendMessage(ctx, in, req.AdID); err != nil {
		return err
	}

	return c.NoContent(http.StatusNoContent)
}

type publishRequest struct {
	Content string `json:"content" validate:"required,min=1,max=2000"`

	AdID           string `json:"adId" validate:"required_without=ConversationID,omitempty,uuid"`
	ConversationID string `json:"conversationId" validate:"required_without=AdID,omitempty,uuid"`
}

func publishRequestToMessage(req *publishRequest, userID string) entity.Message {
	return entity.Message{
		SenderID:       userID,
		ConversationID: req.ConversationID,

		Content: req.Content,
	}
}
