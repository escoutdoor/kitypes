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
	GetByID(ctx context.Context, userID string) (entity.User, error)
	Update(ctx context.Context, in entity.UpdateUser) (entity.User, error)
}

type handler struct {
	service userService
	cv      *validator.CustomValidator
}

func RegisterHandlers(
	e *echo.Group,
	authMw echo.MiddlewareFunc,
	userService userService,
	cv *validator.CustomValidator,
) {
	h := &handler{service: userService, cv: cv}

	e.GET("/:id", h.getMe)

	e.PATCH("/:id", h.updateUser, authMw)
}

type meResponse struct {
	ID string `json:"id"`

	AvatarUrl string `json:"avatarUrl"`

	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`

	Email       string `json:"email"`
	PhoneNumber string `json:"phoneNumber"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func meToResponse(user entity.User) meResponse {
	return meResponse{
		ID: user.ID,

		AvatarUrl: *user.AvatarUrl,

		FirstName: user.FirstName,
		LastName:  user.LastName,

		Email:       user.Email,
		PhoneNumber: user.PhoneNumber,

		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}
}
