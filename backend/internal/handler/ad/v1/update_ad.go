package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	ad_service "github.com/escoutdoor/kitypes/backend/internal/service/ad"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (h *handler) updateAd(c echo.Context) error {
	adID := c.Param(idParam)
	if err := uuid.Validate(adID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid id param format")
	}

	req := new(updateAdRequest)
	if err := h.cv.BindValidate(c, req); err != nil {
		return err
	}

	ctx := c.Request().Context()
	in := updateAdRequestToInput(req, adID)

	ad, err := h.service.UpdateAd(ctx, in)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	resp := updateAdResponse{Ad: adToResponse(ad)}
	return c.JSON(http.StatusOK, resp)
}

type updateAdResponse struct {
	Ad adResponse `json:"ad"`
}

type updateAdRequest struct {
	Title       *string `json:"title" validate:"omitempty,min=1"`
	Description *string `json:"description" validate:"omitempty,min=1"`
	ImageUrl    *string `json:"imageUrl" validate:"omitempty,url"`

	PetType     *int32  `json:"petType" validate:"omitempty,gte=1"`
	PetGender   *int32  `json:"petGender" validate:"omitempty,gte=1"`
	PetAgeMonth *int32  `json:"petAgeMonth" validate:"omitempty,gte=1"`
	PetBreed    *string `json:"petBreed" validate:"omitempty,gte=1"`

	Country *string `json:"country"`
	City    *string `json:"city"`

	Status *int32 `json:"status" validate:"omitempty,gte=1"`
}

func updateAdRequestToInput(req *updateAdRequest, adID string) ad_service.UpdateAdInput {
	return ad_service.UpdateAdInput{
		ID: adID,

		Title:       req.Title,
		Description: req.Description,
		ImageUrl:    req.ImageUrl,

		PetType:     (*entity.PetType)(req.PetType),
		PetGender:   (*entity.PetGender)(req.PetGender),
		PetAgeMonth: req.PetAgeMonth,
		PetBreed:    req.PetBreed,

		Country: req.Country,
		City:    req.City,

		Status: (*entity.AdStatus)(req.Status),
	}
}
