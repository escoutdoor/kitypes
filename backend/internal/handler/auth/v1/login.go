package v1

import (
	"net/http"

	auth_service "github.com/escoutdoor/kitypes/backend/internal/service/auth"
	"github.com/labstack/echo/v4"
)

func (h *handler) login(c echo.Context) error {
	req := new(loginRequest)
	if err := h.cv.BindValidate(c, req); err != nil {
		return err
	}

	ctx := c.Request().Context()
	in := loginRequestToInput(req)

	tokens, err := h.service.Login(ctx, in)
	if err != nil {
		return err
	}

	resp := loginResponse{Tokens: tokensToResponse(tokens)}
	return c.JSON(http.StatusOK, resp)
}

type loginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8,max=50"`
}

type loginResponse struct {
	Tokens authResponse `json:"tokens"`
}

func loginRequestToInput(req *loginRequest) auth_service.LoginInput {
	return auth_service.LoginInput{
		Email:    req.Email,
		Password: req.Password,
	}
}
