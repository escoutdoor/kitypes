package v1

import (
	"github.com/labstack/echo/v4"
	"net/http"
)

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
	Email string `json:"email" validate:"required,email"`
}
