package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (h *handler) markMessageAsRead(c echo.Context) error {
	userID, err := httpctx.GetUserID(c)
	if err != nil {
		return err
	}

	convID := c.Param(idParam)
	if err := uuid.Validate(convID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid id param format")
	}

	req := new(markMessageAsReadRequest)
	if err := h.cv.BindValidate(c, req); err != nil {
		return err
	}

	if err := h.service.MarkAsRead(c.Request().Context(), convID, userID, req.LastReadMessageID); err != nil {
		return err
	}

	return c.NoContent(http.StatusNoContent)
}

type markMessageAsReadRequest struct {
	LastReadMessageID string `json:"lastReadMessageId" validate:"required,uuid"`
}
