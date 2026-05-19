package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// @Summary		Ban a user (Admin)
// @Description	Bans a specific user. Requires admin privileges.
// @Tags			Admin Users
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			id	path	string	true	"User ID (UUID)"
// @Success		204	"User successfully banned (No Content)"
// @Failure		400	{object}	response.ErrorResponse	"Invalid UUID format"
// @Failure		401	{object}	response.ErrorResponse	"Unauthorized"
// @Failure		403	{object}	response.ErrorResponse	"Forbidden (Not an admin)"
// @Failure		404	{object}	response.ErrorResponse	"User not found"
// @Failure		500	{object}	response.ErrorResponse	"Internal server error"
// @Router			/admin/users/{id}/ban [patch]
func (h *handler) banUser(c echo.Context) error {
	userID := c.Param(idParam)
	if err := uuid.Validate(userID); err != nil {
		return apperror.InvalidUUID("user id")
	}

	ctx := c.Request().Context()
	if err := h.service.Ban(ctx, userID); err != nil {
		return err
	}

	return c.NoContent(http.StatusNoContent)
}
