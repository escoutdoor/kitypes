package middleware

import (
	"net/http"
	"slices"
	"strings"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	"github.com/escoutdoor/kitypes/backend/internal/util/token"
	"github.com/escoutdoor/kitypes/backend/pkg/response"
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

			tokenPayload, err := tokenProvider.ValidateAccessToken(token)
			if err != nil {
				return err
			}

			c.Set(httpctx.UserIDContextKey, tokenPayload.UserID)
			c.Set(httpctx.RoleContextKey, tokenPayload.Role)
			return next(c)
		}
	}
}

func RequireRoles(allowedRoles ...entity.UserRole) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			userRole, err := httpctx.GetUserRole(c)
			if err != nil {
				return newUnauthorized("user context is missing")
			}

			if slices.Contains(allowedRoles, userRole) {
				return next(c)
			}

			return newForbidden("access denied")
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

			tokenPayload, err := tokenProvider.ValidateAccessToken(token)
			if err != nil {
				return err
			}

			c.Set(httpctx.UserIDContextKey, tokenPayload.UserID)
			c.Set(httpctx.RoleContextKey, tokenPayload.Role)
			return next(c)
		}
	}
}

func newUnauthorized(msg string) error {
	return echo.NewHTTPError(http.StatusUnauthorized, response.ErrorResponse{
		Message: msg,
	})
}

func newForbidden(msg string) error {
	return echo.NewHTTPError(http.StatusForbidden, response.ErrorResponse{
		Message: msg,
	})
}

type tokenProvider interface {
	ValidateAccessToken(accessToken string) (token.TokenPayload, error)
}
