package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/labstack/echo/v4"
)

// @Summary		User login
// @Description	Authenticates a user. Returns an Access token and sets a Refresh token in an HTTP-only cookie.
// @Tags			Auth
// @Accept			json
// @Produce		json
// @Param			request	body		loginRequest			true	"Login credentials"
// @Success		200		{object}	authResponse			"Successful login"
// @Failure		400		{object}	response.ErrorResponse	"Validation error"
// @Failure		401		{object}	response.ErrorResponse	"Incorrect email or password"
// @Failure		403		{object}	response.ErrorResponse	"User account is banned"
// @Failure		500		{object}	response.ErrorResponse	"Internal server error"
// @Router			/auth/login [post]
func (h *handler) login(c echo.Context) error {
	req := new(loginRequest)
	if err := h.cv.BindValidate(c, req); err != nil {
		return err
	}

	ctx := c.Request().Context()
	in := loginRequestToUser(req)

	tokens, err := h.service.Login(ctx, in)
	if err != nil {
		return err
	}

	c.SetCookie(createRefreshCookie(tokens.RefreshToken))

	resp := accessTokenToResponse(tokens.AccessToken)
	return c.JSON(http.StatusOK, resp)
}

type loginRequest struct {
	Email    string `json:"email" validate:"required,email" example:"user@example.com"`
	Password string `json:"password" validate:"required,min=8,max=50" example:"StrongPass123!"`
}

func loginRequestToUser(req *loginRequest) entity.User {
	return entity.User{
		Email:    req.Email,
		Password: req.Password,
	}
}
