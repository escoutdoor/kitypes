package v1

import (
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"net/http"
)

func (h *handler) getPublicUser(c echo.Context) error {
	userID := c.Param(idParam)
	if err := uuid.Validate(userID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid user id parameter")
	}

	ctx := c.Request().Context()

	user, err := h.service.GetPublicUserByID(ctx, userID)
	if err != nil {
		return err
	}

	resp := getPublicProfileResponse{User: h.userToPublicResponse(user)}
	return c.JSON(http.StatusOK, resp)
}

type getPublicProfileResponse struct {
	User publicUserResponse `json:"user"`
}
