package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/labstack/echo/v4"
)

// @Summary		Create advertisement
// @Description	Creates a new pet adoption advertisement.
// @Tags			Ads
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			request	body		createRequest			true	"Advertisement data"
// @Success		201		{object}	createResponse			"Successfully created ad"
// @Failure		400		{object}	response.ErrorResponse	"Validation error"
// @Failure		401		{object}	response.ErrorResponse	"Unauthorized"
// @Failure		500		{object}	response.ErrorResponse	"Internal server error"
// @Router			/ads [post]
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
	Title       string   `json:"title" validate:"required,min=1" example:"Лагідне кошеня"`
	Description string   `json:"description" validate:"required,min=1" example:"Дуже гарне кошеня шукає люблячу родину..."`
	ImageKeys   []string `json:"imageKeys" validate:"required,min=1" example:"ads/123e4567-e89b-12d3-a456-426614174001.jpg,ads/123e4567-e89b-12d3-a456-426614174002.jpg"`

	PetType     int32   `json:"petType" validate:"required,oneof=1 2 3" example:"2"`
	PetGender   int32   `json:"petGender" validate:"required,oneof=1 2" example:"1"`
	PetAgeMonth *int32  `json:"petAgeMonth,omitempty" validate:"omitempty,gte=0" example:"3"`
	PetBreed    *string `json:"petBreed,omitempty" validate:"omitempty,min=1" example:"Без породи"`

	Country string `json:"country" validate:"required,min=1" example:"Україна"`
	City    string `json:"city" validate:"required,min=1" example:"Львів"`
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
