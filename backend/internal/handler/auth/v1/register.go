package v1

import (
	"net/http"

	auth_service "github.com/escoutdoor/kitypes/backend/internal/service/auth"
	"github.com/labstack/echo/v4"
)

func (h *handler) register(c echo.Context) error {
	req := new(registerRequest)
	if err := h.cv.BindValidate(c, req); err != nil {
		return err
	}

	ctx := c.Request().Context()
	in := registerRequestToInput(req)

	tokens, err := h.service.Register(ctx, in)
	if err != nil {
		return err
	}

	resp := registerResponse{Tokens: tokensToResponse(tokens)}
	return c.JSON(http.StatusCreated, resp)
}

type registerRequest struct {
	FirstName string `json:"firstName" validate:"required,min=1,max=20"`
	LastName  string `json:"lastName" validate:"required,min=1,max=20"`

	Email       string `json:"email" validate:"required,email"`
	PhoneNumber string `json:"phoneNumber" validate:"required,e164"`

	Password string `json:"password" validate:"required,min=8,max=20"`
}

type registerResponse struct {
	Tokens authResponse `json:"tokens"`
}

func registerRequestToInput(req *registerRequest) auth_service.CreateUserInput {
	return auth_service.CreateUserInput{
		FirstName: req.FirstName,
		LastName:  req.LastName,

		Email:       req.Email,
		PhoneNumber: req.PhoneNumber,

		Password: req.Password,
	}
}
