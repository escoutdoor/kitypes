package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// @Summary		Get public user profile
// @Description	Retrieves public information of a specific user by ID.
// @Tags			Users
// @Accept			json
// @Produce		json
// @Param			id	path		string						true	"User ID (UUID)"
// @Success		200	{object}	getPublicProfileResponse	"Public profile data"
// @Failure		400	{object}	response.ErrorResponse		"Invalid UUID format"
// @Failure		404	{object}	response.ErrorResponse		"User not found or banned"
// @Failure		500	{object}	response.ErrorResponse		"Internal server error"
// @Router			/users/{id} [get]
func (h *handler) getPublicUser(c echo.Context) error {
	userID := c.Param(idParam)
	if err := uuid.Validate(userID); err != nil {
		return apperror.InvalidUUID("user id")
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
