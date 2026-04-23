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

func Auth(tokenProvider tokenProvider) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			authHeader := c.Request().Header.Get(authorizationHeader)
			if authHeader == "" {
				return newUnauthorized("authorization header not provided")
			}
			if !strings.HasPrefix(authHeader, authorizationHeaderPrefix) {
				return newUnauthorized("invalid authorization header format")
			}
			token := authHeader[len(authorizationHeaderPrefix):]

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
			authHeader := c.Request().Header.Get(authorizationHeader)
			if authHeader == "" {
				// no header -> skip validation below
				return next(c)
			}

			if !strings.HasPrefix(authHeader, authorizationHeaderPrefix) {
				return newUnauthorized("invalid authorization header format")
			}
			token := authHeader[len(authorizationHeaderPrefix):]

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
