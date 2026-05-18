package v1

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/validator"
	"github.com/labstack/echo/v4"
)

type supportService interface {
	SendContactMessage(ctx context.Context, in entity.SendContactInput) error
}

type handler struct {
	service supportService
	cv      *validator.CustomValidator
}

func RegisterHandlers(e *echo.Group, optionalAuthMw echo.MiddlewareFunc, service supportService, cv *validator.CustomValidator) {
	h := &handler{service: service, cv: cv}

	e.POST("/support/contact", h.contact, optionalAuthMw)
}
