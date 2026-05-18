package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// @Summary		Delete advertisement
// @Description	Permanently deletes an advertisement and its associated images. Only the author can delete their ad.
// @Tags			Ads
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			id	path	string	true	"Ad ID (UUID)"
// @Success		204	"Successfully deleted (No Content)"
// @Failure		400	{object}	response.ErrorResponse	"Invalid UUID format"
// @Failure		401	{object}	response.ErrorResponse	"Unauthorized"
// @Failure		403	{object}	response.ErrorResponse	"Forbidden (Not the author)"
// @Failure		404	{object}	response.ErrorResponse	"Ad not found"
// @Failure		500	{object}	response.ErrorResponse	"Internal server error"
// @Router			/ads/{id} [delete]
func (h *handler) delete(c echo.Context) error {
	adID := c.Param(idParam)
	if err := uuid.Validate(adID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid id param format")
	}

	ctx := c.Request().Context()
	userID, err := httpctx.GetUserID(c)
	if err != nil {
		return err
	}

	if err := h.service.Delete(ctx, userID, adID); err != nil {
		return err
	}

	return c.NoContent(http.StatusNoContent)
}
