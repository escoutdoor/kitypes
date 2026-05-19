package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// @Summary		Remove from favorites
// @Description	Removes an advertisement from the user's favorites.
// @Tags			Favorites
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			id	path	string	true	"Ad ID (UUID)"
// @Success		204	"No Content"
// @Failure		400	{object}	response.ErrorResponse	"Invalid UUID format"
// @Failure		401	{object}	response.ErrorResponse	"Unauthorized"
// @Failure		404	{object}	response.ErrorResponse	"Favorite not found"
// @Failure		500	{object}	response.ErrorResponse	"Internal server error"
// @Router			/favorites/{id} [delete]
func (h *handler) remove(c echo.Context) error {
	adID := c.Param(idParam)
	if err := uuid.Validate(adID); err != nil {
		return apperror.InvalidUUID("ad id")
	}

	ctx := c.Request().Context()
	userID, err := httpctx.GetUserID(c)
	if err != nil {
		return err
	}

	if err := h.service.Remove(ctx, userID, adID); err != nil {
		return err
	}

	return c.NoContent(http.StatusNoContent)
}
