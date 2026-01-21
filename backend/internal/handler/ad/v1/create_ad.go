package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	ad_service "github.com/escoutdoor/kitypes/backend/internal/service/ad"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (h *handler) createAd(c echo.Context) error {
	req := new(createAdRequest)
	if err := h.cv.BindValidate(c, req); err != nil {
		return err
	}

	ctx := c.Request().Context()
	// TODO: replace random uuid with the real extracted from ctx one
	in := createAdRequestToInput(req, uuid.NewString())

	ad, err := h.service.CreateAd(ctx, in)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	resp := createAdResponse{Ad: adToResponse(ad)}
	return c.JSON(http.StatusCreated, resp)
}

type createAdResponse struct {
	Ad adResponse `json:"advertisement"`
}

type createAdRequest struct {
	Title       string `json:"title" validate:"required"`
	Description string `json:"description" validate:"required"`
	ImageUrl    string `json:"imageUrl" validate:"required,url"`

	PetType     int32   `json:"petType" validate:"required,gte=1"`
	PetGender   int32   `json:"petGender" validate:"required,gte=0"`
	PetAgeMonth *int32  `json:"petAgeMonth,omitempty" validate:"omitempty,gte=0"`
	PetBreed    *string `json:"petBreed,omitempty"`

	Country string `json:"country" validate:"required"`
	City    string `json:"city" validate:"required"`
}

func createAdRequestToInput(req *createAdRequest, authorID string) ad_service.CreateAdInput {
	return ad_service.CreateAdInput{
		AuthorID: authorID,

		Title:       req.Title,
		Description: req.Description,
		ImageUrl:    req.ImageUrl,

		PetType:     entity.PetType(req.PetType),
		PetGender:   entity.PetGender(req.PetGender),
		PetAgeMonth: req.PetAgeMonth,
		PetBreed:    req.PetBreed,

		Country: req.Country,
		City:    req.City,
	}
}
