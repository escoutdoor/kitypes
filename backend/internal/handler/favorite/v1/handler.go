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

	e.GET("/", h.list)
}

type favoriteResponse struct {
	ID        string     `json:"id"`
	Ad        adResponse `json:"advertisement"`
	CreatedAt time.Time  `json:"createdAt"`
}

type adResponse struct {
	ID       string `json:"id"`
	AuthorID string `json:"authorId"`

	Title       string   `json:"title"`
	Description string   `json:"description"`
	ImageURLs   []string `json:"imageUrls"`

	PetType     int32   `json:"petType"`
	PetGender   int32   `json:"petGender"`
	PetAgeMonth *int32  `json:"petAgeMonth,omitempty"`
	PetBreed    *string `json:"petBreed,omitempty"`

	Country string `json:"country"`
	City    string `json:"city"`

	Status int32 `json:"status"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
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
