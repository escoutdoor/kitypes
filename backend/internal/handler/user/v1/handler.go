package v1

import (
	"context"
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/middleware"
	"github.com/escoutdoor/kitypes/backend/pkg/validator"
	"github.com/labstack/echo/v4"
)

const (
	idParam = "id"
)

type userService interface {
	GetByID(ctx context.Context, userID string) (entity.User, error)
	GetPublicUserByID(ctx context.Context, userID string) (entity.User, error)
	GetUserPhone(ctx context.Context, userID string) (string, error)
	GenerateUploadURL(ctx context.Context, ext string) (string, string, error)
	BuildPublicURL(key string) string

	Update(ctx context.Context, in entity.UpdateUserInput) (entity.User, error)
	UpdatePassword(ctx context.Context, in entity.UpdateUserPasswordInput) error
	UpdateEmail(ctx context.Context, in entity.UpdateUserEmailInput) error

	Delete(ctx context.Context, userID string) error
	DeleteAvatar(ctx context.Context, userID string) error

	List(ctx context.Context, in entity.ListUsersInput) (entity.ListUsersOutput, error)
	UpdateRole(ctx context.Context, userID string, role entity.UserRole) error
	Ban(ctx context.Context, userID string) error
	Unban(ctx context.Context, userID string) error
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

	publicGroup := e.Group("/users")
	publicGroup.GET("/:id", h.getPublicUser)

	userGroup := e.Group("/users", authMw)
	userGroup.GET("/me", h.get)
	userGroup.GET("/:id/phone", h.getPhone)
	userGroup.GET("/upload-url", h.getUploadURL)

	userGroup.DELETE("/me/avatar", h.deleteAvatar)
	userGroup.DELETE("/me", h.delete)

	userGroup.PATCH("/me", h.update)
	userGroup.PATCH("/me/password", h.updatePassword)
	userGroup.PATCH("/me/email", h.updateEmail)

	adminGroup := e.Group("/admin/users")
	adminGroup.Use(authMw, middleware.RequireRoles(entity.RoleAdmin))
	adminGroup.GET("/", h.listAdminUsers)
	adminGroup.PATCH("/:id/role", h.updateRole)
	adminGroup.PATCH("/:id/ban", h.banUser)
	adminGroup.PATCH("/:id/unban", h.unbanUser)
}

type meResponse struct {
	ID   string          `json:"id" example:"123e4567-e89b-12d3-a456-426614174000"`
	Role entity.UserRole `json:"role" example:"volunteer"`

	AvatarURL *string `json:"avatarUrl" example:"https://s3.eu-central-1.amazonaws.com/kitypes/avatars/uuid.jpg"`

	FirstName string `json:"firstName" example:"Анатолій"`
	LastName  string `json:"lastName" example:"Вовк"`

	Email       string `json:"email" example:"user@example.com"`
	PhoneNumber string `json:"phoneNumber" example:"+380991234567"`

	IsBanned bool `json:"isBanned" example:"false"`

	CreatedAt time.Time `json:"createdAt" example:"2026-05-18T14:33:42Z"`
	UpdatedAt time.Time `json:"updatedAt" example:"2026-05-18T14:33:42Z"`
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
		IsBanned:    user.IsBanned,
		CreatedAt:   user.CreatedAt,
		UpdatedAt:   user.UpdatedAt,
	}
}

type publicUserResponse struct {
	ID   string          `json:"id" example:"123e4567-e89b-12d3-a456-426614174000"`
	Role entity.UserRole `json:"role" example:"shelter"`

	AvatarURL *string `json:"avatarUrl,omitempty" example:"https://s3.eu-central-1.amazonaws.com/kitypes/avatars/uuid.jpg"`

	FirstName string `json:"firstName" example:"Ірина"`
	LastName  string `json:"lastName" example:"Попова"`

	CreatedAt time.Time `json:"createdAt" example:"2026-05-18T14:33:42Z"`
}

func (h *handler) userToPublicResponse(user entity.User) publicUserResponse {
	var avatarURL *string
	if user.AvatarKey != nil {
		url := h.service.BuildPublicURL(*user.AvatarKey)
		avatarURL = &url
	}

	return publicUserResponse{
		ID:        user.ID,
		Role:      user.Role,
		AvatarURL: avatarURL,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		CreatedAt: user.CreatedAt,
	}
}
