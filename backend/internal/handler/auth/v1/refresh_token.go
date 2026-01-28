package v1

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h *handler) refreshToken(c echo.Context) error {
	req := new(refreshTokenRequest)
	if err := h.cv.BindValidate(c, req); err != nil {
		return err
	}

	ctx := c.Request().Context()

	tokens, err := h.service.RefreshToken(ctx, req.RefreshToken)
	if err != nil {
		return err
	}

	resp := refreshTokenResponse{Tokens: tokensToResponse(tokens)}
	return c.JSON(http.StatusCreated, resp)
}

type refreshTokenRequest struct {
	RefreshToken string `json:"refreshToken" validate:"required"`
}

type refreshTokenResponse struct {
	Tokens authResponse `json:"tokens"`
}
