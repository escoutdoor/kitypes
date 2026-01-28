package v1

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (h *handler) getUserByID(c echo.Context) error {
	userID := c.Param(idParam)
	if err := uuid.Validate(userID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid id param format")
	}

	ctx := c.Request().Context()
	user, err := h.service.GetUserByID(ctx, userID)
	if err != nil {
		return err
	}

	resp := getUserByIDResponse{User: userToResponse(user)}
	return c.JSON(http.StatusOK, resp)
}

type getUserByIDResponse struct {
	User userResponse `json:"user"`
}
