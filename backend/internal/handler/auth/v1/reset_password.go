package v1

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

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
	Token       string `json:"token" validate:"required,uuid"`
	NewPassword string `json:"newPassword" validate:"required,min=8,max=20"`
}
