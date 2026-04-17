package v1

import (
	"context"
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/config"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/validator"
	"github.com/labstack/echo/v4"
)

const (
	refreshTokenCookieKey = "refreshToken"
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
	e.POST("/logout", h.logout)
}

type authResponse struct {
	AccessToken string `json:"accessToken"`
}

func accessTokenToResponse(acessToken string) authResponse {
	return authResponse{
		AccessToken: acessToken,
	}
}

func createRefreshCookie(refreshToken string) *http.Cookie {
	cookie := &http.Cookie{
		Name:     refreshTokenCookieKey,
		Value:    refreshToken,
		HttpOnly: true,
		Secure:   false, // TODO: change to TRUE IF HTTPS
		Path:     "/",
		MaxAge:   int(config.Config().JwtToken.RefreshTokenTTL().Seconds()),
		SameSite: http.SameSiteLaxMode,
	}

	return cookie
}
