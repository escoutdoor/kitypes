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

type adService interface {
	Get(ctx context.Context, adID string, viewerID *string, viewerRole *entity.UserRole) (entity.EnrichedAd, error)
	GetPhone(ctx context.Context, adID string) (string, error)
	Create(ctx context.Context, in entity.CreateAdInput) (entity.Ad, error)
	Update(ctx context.Context, in entity.UpdateAdInput) (entity.Ad, error)
	UpdateStatus(ctx context.Context, in entity.UpdateAdStatusInput) error
	Delete(ctx context.Context, userID string, adID string) error
	List(ctx context.Context, in entity.ListAdsInput) (entity.ListAdsOutput, error)

	GenerateUploadURLs(ctx context.Context, exts []string) ([]entity.AdImageUploadTarget, error)
	BuildPublicURL(key string) string
}

type handler struct {
	service adService
	cv      *validator.CustomValidator
}

func RegisterHandlers(
	g *echo.Group,
	authMw echo.MiddlewareFunc,
	optionalAuthMw echo.MiddlewareFunc,
	adService adService,
	cv *validator.CustomValidator,
) {
	h := &handler{service: adService, cv: cv}

	adsGroup := g.Group("/ads")
	adsGroup.POST("/", h.create, authMw)
	adsGroup.POST("/upload-urls", h.getUploadURLs, authMw)
	adsGroup.GET("/me", h.listMyAds, authMw)

	adsGroup.GET("/", h.list, optionalAuthMw)
	adsGroup.GET("/:id", h.get, optionalAuthMw)

	adsGroup.GET("/:id/phone", h.getPhone, authMw)
	adsGroup.PATCH("/:id", h.update, authMw)
	adsGroup.DELETE("/:id", h.delete, authMw)

	adminAdsGroup := g.Group("/admin/ads")
	adminAdsGroup.Use(authMw, middleware.RequireRoles(entity.RoleAdmin))
	adminAdsGroup.GET("/", h.listAdminAds)
	adminAdsGroup.PATCH("/:id/status", h.updateStatus)
}

type adResponse struct {
	ID          string          `json:"id" example:"123e4567-e89b-12d3-a456-426614174000"`
	AuthorID    string          `json:"authorId" example:"987fcdeb-51a2-43d7-9012-3456789abcde"`
	AuthorRole  entity.UserRole `json:"authorRole" example:"volunteer"`
	Title       string          `json:"title" example:"Рудий котик шукає дім"`
	Description string          `json:"description" example:"Класний котик"`
	ImageURLs   []string        `json:"imageUrls" example:"https://s3.amazonaws.com/kitypes/ads/1.jpg,https://s3.amazonaws.com/kitypes/ads/2.jpg"`

	PetType     int32   `json:"petType" example:"2"`
	PetGender   int32   `json:"petGender" example:"1"`
	PetAgeMonth *int32  `json:"petAgeMonth,omitempty" example:"4"`
	PetBreed    *string `json:"petBreed,omitempty" example:"Мейн-кун"`

	Country string `json:"country" example:"Україна"`
	City    string `json:"city" example:"Київ"`
	Status  int32  `json:"status" example:"1"`

	IsFavorite  bool    `json:"isFavorite" example:"true"`
	BlockReason *string `json:"blockReason,omitempty" example:"Порушення правил спільноти"`

	CreatedAt time.Time `json:"createdAt" example:"2026-05-18T14:33:42Z"`
	UpdatedAt time.Time `json:"updatedAt" example:"2026-05-18T14:33:42Z"`
}

type enrichedAdResponse struct {
	adResponse

	AuthorName      string  `json:"authorName" example:"Анатолій Вовк"`
	AuthorAvatarURL *string `json:"authorAvatarUrl,omitempty" example:"https://s3.amazonaws.com/kitypes/avatars/1.jpg"`
}

func (h *handler) adToResponse(ad entity.Ad) adResponse {
	urls := make([]string, 0, len(ad.ImageKeys))
	for _, key := range ad.ImageKeys {
		urls = append(urls, h.service.BuildPublicURL(key))
	}

	return adResponse{
		ID:          ad.ID,
		AuthorID:    ad.AuthorID,
		AuthorRole:  ad.AuthorRole,
		Title:       ad.Title,
		Description: ad.Description,
		ImageURLs:   urls,
		PetType:     int32(ad.PetType),
		PetGender:   int32(ad.PetGender),
		PetAgeMonth: ad.PetAgeMonth,
		PetBreed:    ad.PetBreed,
		Country:     ad.Country,
		City:        ad.City,
		Status:      int32(ad.Status),
		IsFavorite:  ad.IsFavorite,
		BlockReason: ad.BlockReason,
		CreatedAt:   ad.CreatedAt,
		UpdatedAt:   ad.UpdatedAt,
	}
}

func (h *handler) adsToResponse(ads []entity.Ad) []adResponse {
	list := make([]adResponse, 0, len(ads))
	for _, a := range ads {
		list = append(list, h.adToResponse(a))
	}

	return list
}

func (h *handler) enrichedAdToResponse(enriched entity.EnrichedAd) enrichedAdResponse {
	base := h.adToResponse(enriched.Ad)

	var avatarURL *string
	if enriched.AuthorAvatarKey != nil && *enriched.AuthorAvatarKey != "" {
		url := h.service.BuildPublicURL(*enriched.AuthorAvatarKey)
		avatarURL = &url
	}

	return enrichedAdResponse{
		adResponse:      base,
		AuthorName:      enriched.AuthorName,
		AuthorAvatarURL: avatarURL,
	}
}
