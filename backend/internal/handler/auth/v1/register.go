package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/labstack/echo/v4"
)

// @Summary		Register a new user
// @Description	Creates a new user account, returns an Access token.
// @Tags			Auth
// @Accept			json
// @Produce		json
// @Param			request	body		registerRequest			true	"Registration data"
// @Success		201		{object}	authResponse			"Successful registration"
// @Failure		400		{object}	response.ErrorResponse	"Validation error"
// @Failure		409		{object}	response.ErrorResponse	"Email or phone already exists"
// @Failure		500		{object}	response.ErrorResponse	"Internal server error"
// @Router			/auth/register [post]
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

	c.SetCookie(createRefreshCookie(tokens.RefreshToken))

	resp := accessTokenToResponse(tokens.AccessToken)
	return c.JSON(http.StatusCreated, resp)
}

type registerRequest struct {
	FirstName string `json:"firstName" validate:"required,min=1,max=20" example:"Anatolii"`
	LastName  string `json:"lastName" validate:"required,min=1,max=20" example:"Vovk"`

	Email       string `json:"email" validate:"required,email" example:"user@example.com"`
	PhoneNumber string `json:"phoneNumber" validate:"required,uaphone" example:"+380991234567"`

	Password string `json:"password" validate:"required,min=8,max=20" example:"StrongPass123!"`
}

func registerRequestToInput(req *registerRequest) entity.CreateUserInput {
	return entity.CreateUserInput{
		FirstName: req.FirstName,
		LastName:  req.LastName,

		Email:       req.Email,
		PhoneNumber: req.PhoneNumber,

		Password: req.Password,
	}
}
