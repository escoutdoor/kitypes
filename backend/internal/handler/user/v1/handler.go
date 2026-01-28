package v1

import (
	"context"
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/validator"
	"github.com/labstack/echo/v4"
)

const (
	idParam = "id"
)

type userService interface {
	GetUserByID(ctx context.Context, userID string) (entity.User, error)
}

type handler struct {
	service userService
	cv      *validator.CustomValidator
}

func RegisterHandlers(e *echo.Group, userService userService, cv *validator.CustomValidator) {
	ctl := &handler{service: userService, cv: cv}

	e.GET("/:id", ctl.getUserByID)
}

type userResponse struct {
	ID string `json:"id"`

	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`

	Email       string `json:"email"`
	PhoneNumber string `json:"phoneNumber"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func userToResponse(user entity.User) userResponse {
	return userResponse{
		ID: user.ID,

		FirstName: user.FirstName,
		LastName:  user.LastName,

		Email:       user.Email,
		PhoneNumber: user.PhoneNumber,

		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}
}
