package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// @Summary		Get message (Admin)
// @Description	Retrieves a single message by ID. Requires admin privileges.
// @Tags			Admin Chat
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			id	path		string					true	"Message ID (UUID)"
// @Success		200	{object}	getMessageResponse		"Message"
// @Failure		400	{object}	response.ErrorResponse	"Invalid UUID format"
// @Failure		401	{object}	response.ErrorResponse	"Unauthorized"
// @Failure		403	{object}	response.ErrorResponse	"Forbidden (Not an admin)"
// @Failure		404	{object}	response.ErrorResponse	"Message not found"
// @Failure		500	{object}	response.ErrorResponse	"Internal server error"
// @Router			/admin/messages/{id} [get]
func (h *handler) getMessage(c echo.Context) error {
	messageID := c.Param(idParam)
	if err := uuid.Validate(messageID); err != nil {
		return apperror.InvalidUUID("message id")
	}

	ctx := c.Request().Context()
	msg, err := h.service.GetMessage(ctx, messageID)
	if err != nil {
		return err
	}

	resp := getMessageResponse{Message: messageToResponse(msg)}
	return c.JSON(http.StatusOK, resp)
}

type getMessageResponse struct {
	Message messageResponse `json:"message"`
}
