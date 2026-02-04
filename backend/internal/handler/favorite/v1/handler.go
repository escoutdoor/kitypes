package v1

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/pkg/validator"
	"github.com/labstack/echo/v4"
)

const (
	idParam = "id"
)

type favoriteService interface {
	Add(ctx context.Context, userID string, adID string) error
	Remove(ctx context.Context, userID string, adID string) error
}

type handler struct {
	service favoriteService
	cv      *validator.CustomValidator
}

func RegisterHandlers(
	e *echo.Group,
	authMw echo.MiddlewareFunc,
	favoriteService favoriteService,
	cv *validator.CustomValidator,
) {
	h := &handler{service: favoriteService, cv: cv}
	e.Use(authMw)

	// id - addID
	e.POST("/:id", h.add)
	e.DELETE("/:id", h.remove)
}
