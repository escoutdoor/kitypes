package v1

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h *handler) getMessage(c echo.Context) error {
	messageID := c.Param(idParam)
	if messageID == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "message id is required")
	}

	ctx := c.Request().Context()
	msg, err := h.service.GetMessage(ctx, messageID)
	if err != nil {
		return err
	}

	resp := getMessageResponse{Message: messageToResponse(msg)}
	return c.JSON(http.StatusOK, resp)
}

type getMessageResponse struct {
	Message messageResponse `json:"message"`
}
