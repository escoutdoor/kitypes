package httpctx

import (
	"fmt"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/labstack/echo/v4"
)

const (
	UserIDContextKey = "userId"
	RoleContextKey   = "role"
)

func GetUserID(c echo.Context) (string, error) {
	val := c.Get(UserIDContextKey)
	if val == nil {
		return "", fmt.Errorf("userId missing in context")
	}

	id, ok := val.(string)
	if !ok {
		return "", fmt.Errorf("userId cast failed")
	}

	if id == "" {
		return "", fmt.Errorf("userId is empty")
	}

	return id, nil
}

func GetUserRole(c echo.Context) (entity.UserRole, error) {
	val := c.Get(RoleContextKey)
	if val == nil {
		return "", fmt.Errorf("user role not found in context")
	}

	role, ok := val.(entity.UserRole)
	if !ok {
		return "", fmt.Errorf("invalid user role type in context")
	}

	if role == "" {
		return "", fmt.Errorf("user role is empty")
	}

	return role, nil
}

func GetOptionalUserID(c echo.Context) (*string, error) {
	val := c.Get(UserIDContextKey)
	if val == nil {
		return nil, nil
	}

	typedVal, ok := val.(string)
	if !ok {
		return nil, fmt.Errorf("invalid type for user id in context, expected string")
	}

	return &typedVal, nil
}

func GetOptionalUserRole(c echo.Context) (*entity.UserRole, error) {
	val := c.Get(RoleContextKey)
	if val == nil {
		return nil, nil
	}

	role, ok := val.(entity.UserRole)
	if !ok {
		return nil, fmt.Errorf("invalid type for user role in context, expected user role string")
	}

	return &role, nil
}
