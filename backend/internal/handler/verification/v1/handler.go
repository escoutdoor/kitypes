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
	userGroup.POST("/", h.create)
	userGroup.POST("/upload-urls", h.getUploadURLs)
	userGroup.GET("/", h.listMy)

	adminGroup := e.Group("/admin/verifications")
	adminGroup.Use(authMw, middleware.RequireRoles(entity.RoleAdmin))
	adminGroup.GET("/", h.list)
	adminGroup.PATCH("/:id/status", h.updateStatus)
}

type verificationResponse struct {
	ID string `json:"id"`

	RequestedRole entity.UserRole           `json:"requestedRole"`
	Status        entity.VerificationStatus `json:"status"`

	CreatedAt time.Time `json:"createdAt"`
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

	AdminNotes   *string  `json:"adminNotes,omitempty"`
	DocumentURLs []string `json:"documentUrls"`

	User userInfo `json:"user"`
}

type userInfo struct {
	ID          string  `json:"id"`
	FirstName   string  `json:"firstName"`
	LastName    string  `json:"lastName"`
	Email       string  `json:"email"`
	PhoneNumber *string `json:"phoneNumber,omitempty"`
	AvatarURL   *string `json:"avatarUrl,omitempty"`
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
