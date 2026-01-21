package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	ad_service "github.com/escoutdoor/kitypes/backend/internal/service/ad"
	"github.com/labstack/echo/v4"
)

func (h *handler) listAds(c echo.Context) error {
	req := new(listAdsRequest)
	if err := h.cv.BindValidate(c, req); err != nil {
		return err
	}

	ctx := c.Request().Context()
	in := listAdsRequestToInput(req)

	out, err := h.service.ListAds(ctx, in)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	resp := listAdsResponse{Ads: adsToResponse(out.Ads), Total: out.Total}
	return c.JSON(http.StatusOK, resp)
}

type listAdsRequest struct {
	Limit  int    `query:"limit" validate:"omitempty,gte=1,lte=50"`
	Offset int    `query:"offset" validate:"omitempty,gte=0"`
	SortBy string `query:"sortBy" validate:"omitempty,oneof=dateAsc dateDesc"`

	Search *string `query:"search" validate:"omitempty,min=2"`

	Country *string `query:"country"`
	City    *string `query:"city"`

	PetType   *int32 `query:"petType" validate:"omitempty,gte=1"`
	PetGender *int32 `query:"petGender" validate:"omitempty,gte=1"`
	Status    *int32 `query:"status" validate:"omitempty,gte=1"`

	MinPetAgeMonth *int32 `query:"minPetAgeMonth" validate:"omitempty,gte=0"`
	MaxPetAgeMonth *int32 `query:"minPetAgeMonth" validate:"omitempty,gtefield=MaxPetAgeMonth"`
}

type listAdsResponse struct {
	Ads   []adResponse `json:"advertisements"`
	Total int          `json:"total"`
}

func listAdsRequestToInput(req *listAdsRequest) ad_service.ListAdsInput {
	return ad_service.ListAdsInput{
		Limit:  req.Limit,
		Offset: req.Offset,
		SortBy: req.SortBy,

		Search: req.Search,

		Country: req.Country,
		City:    req.City,

		Status: (*entity.AdStatus)(req.Status),

		PetType:   (*entity.PetType)(req.PetType),
		PetGender: (*entity.PetGender)(req.PetGender),

		MinPetAgeMonth: req.MinPetAgeMonth,
		MaxPetAgeMonth: req.MaxPetAgeMonth,
	}
}
