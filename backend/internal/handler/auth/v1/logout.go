package v1

import (
	"net/http"
	"time"

	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/labstack/echo/v4"
)

// @Summary		User logout
// @Description	Removes the Refresh token from the HTTP-only cookie, ending the session.
// @Tags			Auth
// @Accept			json
// @Produce		json
// @Success		200	"Successful logout (cookie cleared)"
// @Router			/auth/logout [post]
func (h *handler) logout(c echo.Context) error {
	cookie := &http.Cookie{
		Name:     refreshTokenCookieKey,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		MaxAge:   -1,
		Expires:  time.Unix(0, 0),
	}

	c.SetCookie(cookie)
	return c.NoContent(http.StatusOK)
}
