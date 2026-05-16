package v1

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (h *handler) banUser(c echo.Context) error {
	userID := c.Param(idParam)
	if err := uuid.Validate(userID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid user id parameter")
	}

	ctx := c.Request().Context()
	if err := h.service.Ban(ctx, userID); err != nil {
		return err
	}

	return c.NoContent(http.StatusNoContent)
}
