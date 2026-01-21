package v1

import (
	"context"
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	ad_service "github.com/escoutdoor/kitypes/backend/internal/service/ad"
	"github.com/escoutdoor/kitypes/backend/pkg/validator"
	"github.com/labstack/echo/v4"
)

const (
	idParam = "id"
)

type adService interface {
	GetAd(ctx context.Context, adID string) (entity.Ad, error)
	CreateAd(ctx context.Context, in ad_service.CreateAdInput) (entity.Ad, error)
	UpdateAd(ctx context.Context, in ad_service.UpdateAdInput) (entity.Ad, error)
	DeleteAd(ctx context.Context, adID string) error
	ListAds(ctx context.Context, in ad_service.ListAdsInput) (ad_service.ListAdsOutput, error)
}

type handler struct {
	service adService
	cv      *validator.CustomValidator
}

func RegisterHandlers(e *echo.Group, adService adService, cv *validator.CustomValidator) {
	ctl := &handler{service: adService, cv: cv}

	e.POST("/", ctl.createAd)

	e.GET("/", ctl.listAds)
	e.GET("/:id", ctl.getAd)

	e.PATCH("/:id", ctl.updateAd)

	e.DELETE("/:id", ctl.deleteAd)
}

type adResponse struct {
	ID       string `json:"id"`
	AuthorID string `json:"authorId"`

	Title       string `json:"title"`
	Description string `json:"description"`
	ImageUrl    string `json:"imageUrl"`

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

func adToResponse(ad entity.Ad) adResponse {
	return adResponse{
		ID:       ad.ID,
		AuthorID: ad.AuthorID,

		Title:       ad.Title,
		Description: ad.Description,
		ImageUrl:    ad.ImageUrl,

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

func adsToResponse(ads []entity.Ad) []adResponse {
	list := make([]adResponse, 0, len(ads))
	for _, a := range ads {
		list = append(list, adToResponse(a))
	}

	return list
}
