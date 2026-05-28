package v1

import (
	"github.com/labstack/echo/v4"
)

type handler struct {
}

func RegisterHandlers(
	g *echo.Group,
) {
	h := &handler{}

	g.GET("/health", h.checkHealth)
}
