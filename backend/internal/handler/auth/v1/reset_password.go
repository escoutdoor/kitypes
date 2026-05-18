package v1

import (
	"net/http"

	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/labstack/echo/v4"
)

// @Summary		Reset password
// @Description	Sets a new password using the token received via email.
// @Tags			Auth
// @Accept			json
// @Produce		json
// @Param			request	body	resetPasswordRequest	true	"Token and new password"
// @Success		204		"Password successfully changed (No Content)"
// @Failure		400		{object}	response.ErrorResponse	"Validation error or token is invalid/expired"
// @Failure		500		{object}	response.ErrorResponse	"Internal server error"
// @Router			/auth/reset-password [post]
func (h *handler) resetPassword(c echo.Context) error {
	var req resetPasswordRequest
	if err := h.cv.BindValidate(c, &req); err != nil {
		return err
	}

	ctx := c.Request().Context()
	if err := h.service.ResetPassword(ctx, req.Token, req.NewPassword); err != nil {
		return err
	}

	return c.NoContent(http.StatusNoContent)
}

type resetPasswordRequest struct {
	Token       string `json:"token" validate:"required,uuid" example:"123e4567-e89b-12d3-a456-426614174000"`
	NewPassword string `json:"newPassword" validate:"required,min=8,max=20" example:"NewStrongPass123!"`
}
