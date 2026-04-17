package v1

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
)

func (h *handler) logout(c echo.Context) error {
	cookie := &http.Cookie{
		Name:     refreshTokenCookieKey,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   false, // TODO: change to TRUE IF HTTPS
		MaxAge:   -1,
		Expires:  time.Unix(0, 0),
	}

	c.SetCookie(cookie)
	return c.NoContent(http.StatusOK)
}
