package v1

import (
	"net/http"

	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/labstack/echo/v4"
)

// @Summary		Forgot password (Request reset link)
// @Description	Sends an email with a password reset link to the provided email address.
// @Tags			Auth
// @Accept			json
// @Produce		json
// @Param			request	body	forgotPasswordRequest	true	"User email"
// @Success		204		"Email successfully sent (No Content)"
// @Failure		400		{object}	response.ErrorResponse	"Validation error"
// @Failure		429		{object}	response.ErrorResponse	"Rate limit exceeded"
// @Failure		500		{object}	response.ErrorResponse	"Internal server error"
// @Router			/auth/forgot-password [post]
func (h *handler) forgotPassword(c echo.Context) error {
	var req forgotPasswordRequest
	if err := h.cv.BindValidate(c, &req); err != nil {
		return err
	}

	ctx := c.Request().Context()
	if err := h.service.ForgotPassword(ctx, req.Email); err != nil {
		return err
	}

	return c.NoContent(http.StatusNoContent)
}

type forgotPasswordRequest struct {
	Email string `json:"email" validate:"required,email" example:"user@example.com"`
}
