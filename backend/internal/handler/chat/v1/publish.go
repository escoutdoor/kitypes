package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/labstack/echo/v4"
)

// @Summary		Send message
// @Description	Sends a message to a conversation or starts a new one by adId.
// @Tags			Chat
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			request	body	publishRequest	true	"Message payload"
// @Success		204		"No Content"
// @Failure		400		{object}	response.ErrorResponse	"Validation error"
// @Failure		401		{object}	response.ErrorResponse	"Unauthorized"
// @Failure		403		{object}	response.ErrorResponse	"Forbidden (banned user or cannot message yourself)"
// @Failure		404		{object}	response.ErrorResponse	"Conversation or ad not found"
// @Failure		500		{object}	response.ErrorResponse	"Internal server error"
// @Router			/conversations/publish [post]
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
	Content string `json:"content" validate:"required,min=1,max=2000" example:"Привіт! Чи актуальне оголошення?"`

	AdID           string `json:"adId" validate:"required_without=ConversationID,omitempty,uuid" example:"123e4567-e89b-12d3-a456-426614174000"`
	ConversationID string `json:"conversationId" validate:"required_without=AdID,omitempty,uuid" example:"987fcdeb-51a2-43d7-9012-3456789abcde"`
}

func publishRequestToMessage(req *publishRequest, userID string) entity.Message {
	return entity.Message{
		SenderID:       userID,
		ConversationID: req.ConversationID,

		Content: req.Content,
	}
}
