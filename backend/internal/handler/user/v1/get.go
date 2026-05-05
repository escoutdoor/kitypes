package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	"github.com/labstack/echo/v4"
)

func (h *handler) get(c echo.Context) error {
	userID, err := httpctx.GetUserID(c)
	if err != nil {
		return err
	}

	ctx := c.Request().Context()
	user, err := h.service.GetByID(ctx, userID)
	if err != nil {
		return err
	}

	resp := getResponse{User: h.meToResponse(user)}
	return c.JSON(http.StatusOK, resp)
}

type getResponse struct {
	User meResponse `json:"user"`
}
