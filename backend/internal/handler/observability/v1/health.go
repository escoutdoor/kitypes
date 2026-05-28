package v1

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h *handler) checkHealth(c echo.Context) error {
	return c.JSON(http.StatusOK, healthCheckResponse{Status: "OK"})
}

type healthCheckResponse struct {
	Status string `json:"status"`
}
