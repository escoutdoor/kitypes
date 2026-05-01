package middleware

import (
	"net/http"
	"strings"

	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	"github.com/labstack/echo/v4"
)

const (
	authorizationHeader       = "Authorization"
	authorizationHeaderPrefix = "Bearer "
)

func extractToken(c echo.Context) string {
	authHeader := c.Request().Header.Get(authorizationHeader)
	if strings.HasPrefix(authHeader, authorizationHeaderPrefix) {
		return authHeader[len(authorizationHeaderPrefix):]
	}

	return c.QueryParam("token")
}

func Auth(tokenProvider tokenProvider) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			token := extractToken(c)
			if token == "" {
				return newUnauthorized("authorization token not provided")
			}

			userID, err := tokenProvider.ValidateAccessToken(token)
			if err != nil {
				return err
			}

			c.Set(httpctx.UserIDContextKey, userID)
			return next(c)
		}
	}
}

func OptionalAuth(tokenProvider tokenProvider) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			token := extractToken(c)
			if token == "" {
				// no header and no query param -> skip validation below
				return next(c)
			}

			userID, err := tokenProvider.ValidateAccessToken(token)
			if err != nil {
				return err
			}

			c.Set(httpctx.UserIDContextKey, userID)
			return next(c)
		}
	}
}

func newUnauthorized(msg string) error {
	return echo.NewHTTPError(http.StatusUnauthorized, msg)
}

type tokenProvider interface {
	ValidateAccessToken(accessToken string) (string, error)
}
