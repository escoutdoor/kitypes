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
	in := createRequestToInput(req, userID)

	ad, err := h.service.Create(ctx, in)
	if err != nil {
		return err
	}

	resp := createResponse{Ad: h.adToResponse(ad)}
	return c.JSON(http.StatusCreated, resp)
}

type createResponse struct {
	Ad adResponse `json:"advertisement"`
}

type createRequest struct {
	Title       string   `json:"title" validate:"required,min=1"`
	Description string   `json:"description" validate:"required,min=1"`
	ImageKeys   []string `json:"imageKeys" validate:"required,min=1"`

	PetType     int32   `json:"petType" validate:"required,oneof=1 2 3"`
	PetGender   int32   `json:"petGender" validate:"required,oneof=1 2"`
	PetAgeMonth *int32  `json:"petAgeMonth,omitempty" validate:"omitempty,gte=0"`
	PetBreed    *string `json:"petBreed,omitempty" validate:"omitempty,min=1"`

	Country string `json:"country" validate:"required,min=1"`
	City    string `json:"city" validate:"required,min=1"`
}

func createRequestToInput(req *createRequest, userID string) entity.CreateAdInput {
	return entity.CreateAdInput{
		UserID: userID,

		Title:       req.Title,
		Description: req.Description,
		ImageKeys:   req.ImageKeys,

		PetType:     entity.PetType(req.PetType),
		PetGender:   entity.PetGender(req.PetGender),
		PetAgeMonth: req.PetAgeMonth,
		PetBreed:    req.PetBreed,

		Country: req.Country,
		City:    req.City,
	}
}
