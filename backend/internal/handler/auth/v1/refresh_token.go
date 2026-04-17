package v1

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h *handler) refreshToken(c echo.Context) error {
	refreshTokenCookie, err := c.Cookie(refreshTokenCookieKey)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, "refresh token not found")
	}

	ctx := c.Request().Context()
	tokens, err := h.service.RefreshToken(ctx, refreshTokenCookie.Value)
	if err != nil {
		return err
	}

	c.SetCookie(createRefreshCookie(tokens.RefreshToken))

	resp := accessTokenToResponse(tokens.AccessToken)
	return c.JSON(http.StatusCreated, resp)
}
