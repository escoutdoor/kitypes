package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/labstack/echo/v4"
)

// @Summary		List advertisements
// @Description	Retrieves a paginated list of active advertisements with filtering options.
// @Tags			Ads
// @Accept			json
// @Produce		json
// @Param			query	query		listRequest				false	"Filtering and pagination parameters"
// @Success		200		{object}	listResponse			"List of advertisements"
// @Failure		400		{object}	response.ErrorResponse	"Validation error"
// @Failure		500		{object}	response.ErrorResponse	"Internal server error"
// @Router			/ads/ [get]
func (h *handler) list(c echo.Context) error {
	req := new(listRequest)
	if err := h.cv.BindValidate(c, req); err != nil {
		return err
	}

	viewerID, err := httpctx.GetOptionalUserID(c)
	if err != nil {
		return err
	}

	ctx := c.Request().Context()
	in := listRequestToInput(req, viewerID)

	out, err := h.service.List(ctx, in)
	if err != nil {
		return err
	}

	resp := listResponse{Ads: h.adsToResponse(out.Ads), Total: out.Total}
	return c.JSON(http.StatusOK, resp)
}

type listRequest struct {
	Limit  int    `query:"limit" validate:"omitempty,gte=1,lte=50" example:"15"`
	Offset int    `query:"offset" validate:"omitempty,gte=0" example:"0"`
	SortBy string `query:"sortBy" validate:"omitempty,oneof=dateAsc dateDesc" example:"dateDesc"`

	Search *string `query:"search" validate:"omitempty,min=2" example:"котик"`

	Country *string `query:"country" example:"Україна"`
	City    *string `query:"city" example:"Дніпро"`

	PetType   *int32 `query:"petType" validate:"omitempty,oneof=1 2 3" example:"2"`
	PetGender *int32 `query:"petGender" validate:"omitempty,oneof=1 2" example:"1"`
	Status    *int32 `query:"status" validate:"omitempty,oneof=1 2" example:"1"`

	MinPetAgeMonth *int32 `query:"minPetAgeMonth" validate:"omitempty,gte=0" example:"2"`
	MaxPetAgeMonth *int32 `query:"maxPetAgeMonth" validate:"omitempty,gte=0" example:"12"`

	VerifiedOnly *bool   `query:"verifiedOnly" example:"true"`
	AuthorID     *string `query:"authorId" validate:"omitempty,uuid" example:"123e4567-e89b-12d3-a456-426614174000"`
}

type listResponse struct {
	Ads   []adResponse `json:"advertisements"`
	Total int          `json:"total" example:"150"`
}

func listRequestToInput(req *listRequest, viewerID *string) entity.ListAdsInput {
	var status *entity.AdStatus
	if req.Status == nil {
		openedStatus := entity.AdStatusOpened
		status = &openedStatus
	} else {
		val := entity.AdStatus(*req.Status)
		status = &val
	}

	return entity.ListAdsInput{
		Limit:  req.Limit,
		Offset: req.Offset,
		SortBy: req.SortBy,

		Search: req.Search,

		Country: req.Country,
		City:    req.City,

		Status: status,

		PetType:   (*entity.PetType)(req.PetType),
		PetGender: (*entity.PetGender)(req.PetGender),

		MinPetAgeMonth: req.MinPetAgeMonth,
		MaxPetAgeMonth: req.MaxPetAgeMonth,

		ViewerID: viewerID,

		VerifiedOnly: req.VerifiedOnly,
		AuthorID:     req.AuthorID,
	}
}
