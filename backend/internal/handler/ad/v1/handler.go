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
	adminAdsGroup.PATCH("/:id/status", h.updateStatus)
}

type adResponse struct {
	ID          string          `json:"id"`
	AuthorID    string          `json:"authorId"`
	AuthorRole  entity.UserRole `json:"authorRole"`
	Title       string          `json:"title"`
	Description string          `json:"description"`
	ImageURLs   []string        `json:"imageUrls"`

	PetType     int32   `json:"petType"`
	PetGender   int32   `json:"petGender"`
	PetAgeMonth *int32  `json:"petAgeMonth,omitempty"`
	PetBreed    *string `json:"petBreed,omitempty"`

	Country string `json:"country"`
	City    string `json:"city"`
	Status  int32  `json:"status"`

	IsFavorite  bool    `json:"isFavorite"`
	BlockReason *string `json:"blockReason,omitempty"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type enrichedAdResponse struct {
	adResponse

	AuthorName      string  `json:"authorName"`
	AuthorAvatarURL *string `json:"authorAvatarUrl,omitempty"`
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
