package verification

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

type verificationService interface {
	Create(ctx context.Context, in entity.CreateVerificationRequestInput) (entity.VerificationRequest, error)
	UpdateStatus(ctx context.Context, in entity.UpdateVerificationStatusInput) error
	List(ctx context.Context, in entity.ListVerificationsInput) (entity.ListVerificationsOutput, error)

	GenerateUploadURLs(ctx context.Context, exts []string) ([]entity.VerificationDocumentUploadTarget, error)
	GenerateDownloadURLs(ctx context.Context, keys []string) ([]string, error)
	BuildPublicURL(key string) string
}

type handler struct {
	service verificationService
	cv      *validator.CustomValidator
}

func RegisterHandlers(
	e *echo.Group,
	authMw echo.MiddlewareFunc,
	service verificationService,
	cv *validator.CustomValidator,
) {
	h := &handler{service: service, cv: cv}

	userGroup := e.Group("/verifications")
	userGroup.Use(authMw)
	userGroup.POST("", h.create)
	userGroup.POST("/upload-urls", h.getUploadURLs)
	userGroup.GET("", h.listMy)

	adminGroup := e.Group("/admin/verifications")
	adminGroup.Use(authMw, middleware.RequireRoles(entity.RoleAdmin))
	adminGroup.GET("", h.list)
	adminGroup.PATCH("/:id/status", h.updateStatus)
}

type verificationResponse struct {
	ID string `json:"id" example:"123e4567-e89b-12d3-a456-426614174000"`

	RequestedRole entity.UserRole           `json:"requestedRole" example:"volunteer"`
	Status        entity.VerificationStatus `json:"status" example:"pending"`

	CreatedAt time.Time `json:"createdAt" example:"2026-05-18T14:33:42Z"`
}

func verificationToResponse(verification entity.VerificationRequest) verificationResponse {
	return verificationResponse{
		ID:            verification.ID,
		RequestedRole: verification.RequestedRole,
		Status:        verification.Status,
		CreatedAt:     verification.CreatedAt,
	}
}

type enrichedVerificationResponse struct {
	verificationResponse

	AdminNotes   *string  `json:"adminNotes,omitempty" example:"Документи не відповідають вимогам"`
	DocumentURLs []string `json:"documentUrls" example:"https://s3.amazonaws.com/kitypes/verifications/1.jpg"`

	User userInfo `json:"user"`
}

type userInfo struct {
	ID          string  `json:"id" example:"987fcdeb-51a2-43d7-9012-3456789abcde"`
	FirstName   string  `json:"firstName" example:"Анатолій"`
	LastName    string  `json:"lastName" example:"Вовк"`
	Email       string  `json:"email" example:"user@example.com"`
	PhoneNumber *string `json:"phoneNumber,omitempty" example:"+380991234567"`
	AvatarURL   *string `json:"avatarUrl,omitempty" example:"https://s3.amazonaws.com/kitypes/avatars/1.jpg"`
}

func (h *handler) enrichedVerificationToResponse(ctx context.Context, vr entity.EnrichedVerificationRequest) (enrichedVerificationResponse, error) {
	var avatarURL *string
	if vr.UserAvatarKey != nil {
		url := h.service.BuildPublicURL(*vr.UserAvatarKey)
		avatarURL = &url
	}

	resp := enrichedVerificationResponse{
		verificationResponse: verificationToResponse(vr.VerificationRequest),
		AdminNotes:           vr.AdminNotes,
		User: userInfo{
			ID:          vr.UserID,
			FirstName:   vr.UserFirstName,
			LastName:    vr.UserLastName,
			Email:       vr.UserEmail,
			PhoneNumber: vr.UserPhoneNumber,
			AvatarURL:   avatarURL,
		},
	}

	documentURLs, err := h.service.GenerateDownloadURLs(ctx, vr.DocumentKeys)
	if err != nil {
		return enrichedVerificationResponse{}, err
	}

	resp.DocumentURLs = documentURLs
	return resp, nil
}
