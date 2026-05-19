package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// @Summary		Mark messages as read
// @Description	Marks messages as read up to the specified lastReadMessageId.
// @Tags			Chat
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			id		path	string						true	"Conversation ID (UUID)"
// @Param			request	body	markMessageAsReadRequest	true	"Last read message ID"
// @Success		204		"No Content"
// @Failure		400		{object}	response.ErrorResponse	"Validation error or invalid UUID"
// @Failure		401		{object}	response.ErrorResponse	"Unauthorized"
// @Failure		403		{object}	response.ErrorResponse	"Forbidden (not a participant)"
// @Failure		404		{object}	response.ErrorResponse	"Conversation not found"
// @Failure		500		{object}	response.ErrorResponse	"Internal server error"
// @Router			/conversations/{id}/read [patch]
func (h *handler) markMessageAsRead(c echo.Context) error {
	userID, err := httpctx.GetUserID(c)
	if err != nil {
		return err
	}

	convID := c.Param(idParam)
	if err := uuid.Validate(convID); err != nil {
		return apperror.InvalidUUID("conversation id")
	}

	req := new(markMessageAsReadRequest)
	if err := h.cv.BindValidate(c, req); err != nil {
		return err
	}

	if err := h.service.MarkAsRead(c.Request().Context(), convID, userID, req.LastReadMessageID); err != nil {
		return err
	}

	return c.NoContent(http.StatusNoContent)
}

type markMessageAsReadRequest struct {
	LastReadMessageID string `json:"lastReadMessageId" validate:"required,uuid" example:"123e4567-e89b-12d3-a456-426614174000"`
}
