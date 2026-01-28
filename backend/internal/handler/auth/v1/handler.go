package v1

import (
	"context"

	auth_service "github.com/escoutdoor/kitypes/backend/internal/service/auth"
	"github.com/escoutdoor/kitypes/backend/pkg/validator"
	"github.com/labstack/echo/v4"
)

type authService interface {
	Login(ctx context.Context, in auth_service.LoginInput) (auth_service.Tokens, error)
	Register(ctx context.Context, in auth_service.CreateUserInput) (auth_service.Tokens, error)
	RefreshToken(ctx context.Context, refreshToken string) (auth_service.Tokens, error)
}

type handler struct {
	service authService
	cv      *validator.CustomValidator
}

func RegisterHandlers(e *echo.Group, authService authService, cv *validator.CustomValidator) {
	ctl := &handler{service: authService, cv: cv}

	e.POST("/login", ctl.login)
	e.POST("/register", ctl.register)
	e.POST("/refresh", ctl.refreshToken)
}

type authResponse struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

func tokensToResponse(tokens auth_service.Tokens) authResponse {
	return authResponse{
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
	}
}
