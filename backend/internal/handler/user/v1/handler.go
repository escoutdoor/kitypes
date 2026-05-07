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
	GenerateUploadURL(ctx context.Context, ext string) (string, string, error)
	BuildPublicURL(key string) string

	Update(ctx context.Context, in entity.UpdateUserInput) (entity.User, error)
	UpdatePassword(ctx context.Context, in entity.UpdateUserPasswordInput) error
	UpdateEmail(ctx context.Context, in entity.UpdateUserEmailInput) error

	Delete(ctx context.Context, userID string) error
	DeleteAvatar(ctx context.Context, userID string) error
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

	e.GET("/me", h.get)
	e.GET("/upload-url", h.getUploadURL)

	e.DELETE("/me/avatar", h.deleteAvatar)
	e.DELETE("/me", h.delete)

	e.PATCH("/me", h.update)
	e.PATCH("/me/password", h.updatePassword)
	e.PATCH("/me/email", h.updateEmail)
}

type meResponse struct {
	ID   string          `json:"id"`
	Role entity.UserRole `json:"role"`

	AvatarURL *string `json:"avatarUrl"`

	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`

	Email       string `json:"email"`
	PhoneNumber string `json:"phoneNumber"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (h *handler) meToResponse(user entity.User) meResponse {
	var avatarURL *string
	if user.AvatarKey != nil {
		url := h.service.BuildPublicURL(*user.AvatarKey)
		avatarURL = &url
	}

	return meResponse{
		ID:          user.ID,
		Role:        user.Role,
		AvatarURL:   avatarURL,
		FirstName:   user.FirstName,
		LastName:    user.LastName,
		Email:       user.Email,
		PhoneNumber: user.PhoneNumber,
		CreatedAt:   user.CreatedAt,
		UpdatedAt:   user.UpdatedAt,
	}
}
