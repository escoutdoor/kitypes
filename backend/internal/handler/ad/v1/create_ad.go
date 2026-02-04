package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	"github.com/labstack/echo/v4"
)

func (h *handler) create(c echo.Context) error {
	req := new(createRequest)
	if err := h.cv.BindValidate(c, req); err != nil {
		return err
	}

	ctx := c.Request().Context()
	userID, err := httpctx.GetUserID(c)
	if err != nil {
		return err
	}
	in := createRequestToAd(req, userID)

	ad, err := h.service.Create(ctx, in)
	if err != nil {
		return err
	}

	resp := createResponse{Ad: adToResponse(ad)}
	return c.JSON(http.StatusCreated, resp)
}

type createResponse struct {
	Ad adResponse `json:"advertisement"`
}

type createRequest struct {
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

func createRequestToAd(req *createRequest, authorID string) entity.Ad {
	return entity.Ad{
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
