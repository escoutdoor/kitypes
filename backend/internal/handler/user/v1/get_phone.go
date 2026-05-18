package v1

import (
	"net/http"

	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// @Summary		Get user's phone number
// @Description	Retrieves the phone number of a specific user by ID.
// @Tags			Users
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			id	path		string					true	"User ID (UUID)"
// @Success		200	{object}	getPhoneResponse		"User's phone number"
// @Failure		400	{object}	response.ErrorResponse	"Invalid UUID format"
// @Failure		401	{object}	response.ErrorResponse	"Unauthorized"
// @Failure		404	{object}	response.ErrorResponse	"User not found or banned"
// @Failure		500	{object}	response.ErrorResponse	"Internal server error"
// @Router			/users/{id}/phone [get]
func (h *handler) getPhone(c echo.Context) error {
	userID := c.Param(idParam)
	if err := uuid.Validate(userID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid user id parameter")
	}

	ctx := c.Request().Context()
	phone, err := h.service.GetUserPhone(ctx, userID)
	if err != nil {
		return err
	}

	resp := getPhoneResponse{Phone: phone}
	return c.JSON(http.StatusOK, resp)
}

type getPhoneResponse struct {
	Phone string `json:"phone"`
}
