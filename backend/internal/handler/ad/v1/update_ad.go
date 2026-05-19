package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// @Summary		Update advertisement
// @Description	Updates an existing advertisement. Only the author can update their ad.
// @Tags			Ads
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			id		path		string					true	"Ad ID (UUID)"
// @Param			request	body		updateRequest			true	"Data to update"
// @Success		200		{object}	updateResponse			"Successfully updated ad"
// @Failure		400		{object}	response.ErrorResponse	"Validation error or invalid UUID format"
// @Failure		401		{object}	response.ErrorResponse	"Unauthorized"
// @Failure		403		{object}	response.ErrorResponse	"Forbidden (Not the author or ad is blocked)"
// @Failure		404		{object}	response.ErrorResponse	"Ad not found"
// @Failure		500		{object}	response.ErrorResponse	"Internal server error"
// @Router			/ads/{id} [patch]
func (h *handler) update(c echo.Context) error {
	adID := c.Param(idParam)
	if err := uuid.Validate(adID); err != nil {
		return apperror.InvalidUUID("ad id")
	}

	req := new(updateRequest)
	if err := h.cv.BindValidate(c, req); err != nil {
		return err
	}

	ctx := c.Request().Context()
	userID, err := httpctx.GetUserID(c)
	if err != nil {
		return err
	}

	in := updateRequestToInput(req, adID, userID)

	ad, err := h.service.Update(ctx, in)
	if err != nil {
		return err
	}

	resp := updateResponse{Ad: h.adToResponse(ad)}
	return c.JSON(http.StatusOK, resp)
}

type updateResponse struct {
	Ad adResponse `json:"advertisement"`
}

type updateRequest struct {
	Title       *string  `json:"title" validate:"omitempty,min=1" example:"Оновлений заголовок"`
	Description *string  `json:"description" validate:"omitempty,min=1" example:"Оновлений опис..."`
	ImageKeys   []string `json:"imageKeys" validate:"omitempty,min=1" example:"ads/123e4567.jpg"`

	PetType     *int32  `json:"petType" validate:"omitempty,oneof=1 2 3" example:"2"`
	PetGender   *int32  `json:"petGender" validate:"omitempty,oneof=1 2" example:"1"`
	PetAgeMonth *int32  `json:"petAgeMonth" validate:"omitempty,gte=0" example:"5"`
	PetBreed    *string `json:"petBreed" validate:"omitempty,min=1" example:"Сфінкс"`

	Country *string `json:"country" example:"Україна"`
	City    *string `json:"city" example:"Одеса"`

	Status *int32 `json:"status" validate:"omitempty,oneof=1 2" example:"2"`
}

func updateRequestToInput(req *updateRequest, adID string, userID string) entity.UpdateAdInput {
	return entity.UpdateAdInput{
		ID:     adID,
		UserID: userID,

		Title:       req.Title,
		Description: req.Description,
		ImageKeys:   req.ImageKeys,

		PetType:     (*entity.PetType)(req.PetType),
		PetGender:   (*entity.PetGender)(req.PetGender),
		PetAgeMonth: req.PetAgeMonth,
		PetBreed:    req.PetBreed,

		Country: req.Country,
		City:    req.City,

		Status: (*entity.AdStatus)(req.Status),
	}
}
