package v1

import (
	"net/http"

	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/labstack/echo/v4"
)

// @Summary		Refresh tokens
// @Description	Refreshes Access and Refresh tokens using the Refresh token from the HTTP-only cookie.
// @Tags			Auth
// @Accept			json
// @Produce		json
// @Success		201	{object}	authResponse			"Tokens successfully refreshed"
// @Failure		401	{object}	response.ErrorResponse	"Refresh token is missing, invalid, or expired"
// @Failure		403	{object}	response.ErrorResponse	"User account is banned"
// @Failure		500	{object}	response.ErrorResponse	"Internal server error"
// @Router			/auth/refresh [post]
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
