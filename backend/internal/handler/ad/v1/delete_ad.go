package v1

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (h *handler) deleteAd(c echo.Context) error {
	// TODO: w8n for author impl
	adID := c.Param(idParam)
	if err := uuid.Validate(adID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid id param format")
	}

	ctx := c.Request().Context()
	if err := h.service.DeleteAd(ctx, adID); err != nil {
		return err
	}

	return c.NoContent(http.StatusNoContent)
}
