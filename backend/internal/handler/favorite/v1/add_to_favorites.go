package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// @Summary		Add to favorites
// @Description	Adds an advertisement to the user's favorites.
// @Tags			Favorites
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			id	path	string	true	"Ad ID (UUID)"
// @Success		204	"No Content"
// @Failure		400	{object}	response.ErrorResponse	"Invalid UUID format"
// @Failure		401	{object}	response.ErrorResponse	"Unauthorized"
// @Failure		404	{object}	response.ErrorResponse	"Ad not found"
// @Failure		409	{object}	response.ErrorResponse	"Advertisement already in favorites"
// @Failure		500	{object}	response.ErrorResponse	"Internal server error"
// @Router			/favorites/{id} [post]
func (h *handler) add(c echo.Context) error {
	adID := c.Param(idParam)
	if err := uuid.Validate(adID); err != nil {
		return apperror.InvalidUUID("ad id")
	}

	ctx := c.Request().Context()
	userID, err := httpctx.GetUserID(c)
	if err != nil {
		return err
	}

	if err := h.service.Add(ctx, userID, adID); err != nil {
		return err
	}

	return c.NoContent(http.StatusNoContent)
}
