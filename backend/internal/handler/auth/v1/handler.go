package v1

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/validator"
	"github.com/labstack/echo/v4"
)

type authService interface {
	Login(ctx context.Context, in entity.User) (entity.Tokens, error)
	Register(ctx context.Context, in entity.User) (entity.Tokens, error)
	RefreshToken(ctx context.Context, refreshToken string) (entity.Tokens, error)
}

type handler struct {
	service authService
	cv      *validator.CustomValidator
}

func RegisterHandlers(e *echo.Group, authService authService, cv *validator.CustomValidator) {
	h := &handler{service: authService, cv: cv}

	e.POST("/login", h.login)
	e.POST("/register", h.register)
	e.POST("/refresh", h.refreshToken)
}

type authResponse struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

func tokensToResponse(tokens entity.Tokens) authResponse {
	return authResponse{
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
	}
}
