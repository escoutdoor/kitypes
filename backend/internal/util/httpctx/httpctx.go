package httpctx

import (
	"fmt"

	"github.com/labstack/echo/v4"
)

const (
	UserIDContextKey = "userId"
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
