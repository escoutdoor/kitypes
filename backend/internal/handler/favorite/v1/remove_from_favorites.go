package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (h *handler) remove(c echo.Context) error {
	adID := c.Param(idParam)
	if err := uuid.Validate(adID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid id param format")
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
