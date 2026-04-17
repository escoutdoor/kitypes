package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/labstack/echo/v4"
)

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
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8,max=50"`
}

func loginRequestToUser(req *loginRequest) entity.User {
	return entity.User{
		Email:    req.Email,
		Password: req.Password,
	}
}
