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

type favoriteService interface {
	Add(ctx context.Context, userID string, adID string) error
	Remove(ctx context.Context, userID string, adID string) error
	List(ctx context.Context, in entity.ListFavoritesInput) (entity.ListFavoritesOutput, error)

	BuildPublicURL(key string) string
}

type handler struct {
	service favoriteService
	cv      *validator.CustomValidator
}

func RegisterHandlers(
	e *echo.Group,
	authMw echo.MiddlewareFunc,
	favoriteService favoriteService,
	cv *validator.CustomValidator,
) {
	h := &handler{service: favoriteService, cv: cv}
	e.Use(authMw)

	e.POST("/:id", h.add)
	e.DELETE("/:id", h.remove)

	e.GET("", h.list)
}

type favoriteResponse struct {
	ID        string     `json:"id" example:"123e4567-e89b-12d3-a456-426614174000"`
	Ad        adResponse `json:"advertisement"`
	CreatedAt time.Time  `json:"createdAt" example:"2026-05-18T14:33:42Z"`
}

type adResponse struct {
	ID       string `json:"id" example:"987fcdeb-51a2-43d7-9012-3456789abcde"`
	AuthorID string `json:"authorId" example:"123e4567-e89b-12d3-a456-426614174000"`

	Title       string   `json:"title" example:"Рудий котик шукає дім"`
	Description string   `json:"description" example:"Дуже гарний котик"`
	ImageURLs   []string `json:"imageUrls" example:"https://s3.amazonaws.com/kitypes/ads/1.jpg,https://s3.amazonaws.com/kitypes/ads/2.jpg"`

	PetType     int32   `json:"petType" example:"2"`
	PetGender   int32   `json:"petGender" example:"1"`
	PetAgeMonth *int32  `json:"petAgeMonth,omitempty" example:"4"`
	PetBreed    *string `json:"petBreed,omitempty" example:"Мейн-кун"`

	Country string `json:"country" example:"Україна"`
	City    string `json:"city" example:"Київ"`

	Status int32 `json:"status" example:"1"`

	CreatedAt time.Time `json:"createdAt" example:"2026-05-18T14:33:42Z"`
	UpdatedAt time.Time `json:"updatedAt" example:"2026-05-18T14:33:42Z"`
}

func (h *handler) favoriteToResponse(favorite entity.Favorite) favoriteResponse {
	return favoriteResponse{
		ID:        favorite.ID,
		Ad:        h.adToResponse(favorite.Ad),
		CreatedAt: favorite.CreatedAt,
	}
}

func (h *handler) adToResponse(ad entity.Ad) adResponse {
	urls := make([]string, 0, len(ad.ImageKeys))
	for _, key := range ad.ImageKeys {
		urls = append(urls, h.service.BuildPublicURL(key))
	}

	return adResponse{
		ID:          ad.ID,
		AuthorID:    ad.AuthorID,
		Title:       ad.Title,
		Description: ad.Description,
		ImageURLs:   urls,

		PetType:     int32(ad.PetType),
		PetGender:   int32(ad.PetGender),
		PetAgeMonth: ad.PetAgeMonth,
		PetBreed:    ad.PetBreed,

		Country: ad.Country,
		City:    ad.City,

		Status: int32(ad.Status),

		CreatedAt: ad.CreatedAt,
		UpdatedAt: ad.UpdatedAt,
	}
}

func (h *handler) adsToResponse(ads []entity.Ad) []adResponse {
	list := make([]adResponse, 0, len(ads))
	for _, a := range ads {
		list = append(list, h.adToResponse(a))
	}

	return list
}
