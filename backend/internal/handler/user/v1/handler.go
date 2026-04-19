package v1

import (
	"context"
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/validator"
	"github.com/labstack/echo/v4"
)

type userService interface {
	GetByID(ctx context.Context, userID string) (entity.User, error)
	Update(ctx context.Context, in entity.UpdateUserInput) (entity.User, error)

	GenerateUploadURL(ctx context.Context, ext string) (string, string, error)
	BuildPublicURL(key string) string
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
	e.Use(authMw)

	e.GET("/me", h.getMe)
	e.GET("/upload-url", h.getUploadUrl, authMw)
	e.PATCH("/me", h.updateUser)
}

type meResponse struct {
	ID string `json:"id"`

	AvatarUrl *string `json:"avatarUrl"`

	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`

	Email       string `json:"email"`
	PhoneNumber string `json:"phoneNumber"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (h *handler) meToResponse(user entity.User) meResponse {
	var avatarUrl *string
	if user.AvatarKey != nil {
		url := h.service.BuildPublicURL(*user.AvatarKey)
		avatarUrl = &url
	}

	return meResponse{
		ID:          user.ID,
		AvatarUrl:   avatarUrl,
		FirstName:   user.FirstName,
		LastName:    user.LastName,
		Email:       user.Email,
		PhoneNumber: user.PhoneNumber,
		CreatedAt:   user.CreatedAt,
		UpdatedAt:   user.UpdatedAt,
	}
}
