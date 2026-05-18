package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/labstack/echo/v4"
)

// @Summary		Delete current user's avatar
// @Description	Deletes the avatar of the currently authenticated user.
// @Tags			Users
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Success		204	"Avatar successfully deleted (No Content)"
// @Failure		401	{object}	response.ErrorResponse	"Unauthorized"
// @Failure		500	{object}	response.ErrorResponse	"Internal server error"
// @Router			/users/me/avatar [delete]
func (h *handler) deleteAvatar(c echo.Context) error {
	ctx := c.Request().Context()

	userID, err := httpctx.GetUserID(c)
	if err != nil {
		return err
	}

	if err := h.service.DeleteAvatar(ctx, userID); err != nil {
		return err
	}

	return c.NoContent(http.StatusNoContent)
}
