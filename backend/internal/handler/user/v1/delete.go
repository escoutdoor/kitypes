package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	"github.com/labstack/echo/v4"
)

func (h *handler) delete(c echo.Context) error {
	ctx := c.Request().Context()

	userID, err := httpctx.GetUserID(c)
	if err != nil {
		return err
	}

	if err := h.service.Delete(ctx, userID); err != nil {
		return err
	}

	return c.NoContent(http.StatusNoContent)
}
