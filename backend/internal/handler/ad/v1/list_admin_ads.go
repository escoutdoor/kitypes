package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/labstack/echo/v4"
)

// @Summary		List all advertisements (Admin)
// @Description	Retrieves a paginated list of all advertisements regardless of status. Requires admin privileges.
// @Tags			Admin Ads
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			query	query		listAdminAdsRequest		false	"Admin filtering parameters"
// @Success		200		{object}	listResponse			"List of all advertisements"
// @Failure		400		{object}	response.ErrorResponse	"Validation error"
// @Failure		401		{object}	response.ErrorResponse	"Unauthorized"
// @Failure		403		{object}	response.ErrorResponse	"Forbidden (Not an admin)"
// @Failure		500		{object}	response.ErrorResponse	"Internal server error"
// @Router			/admin/ads/ [get]
func (h *handler) listAdminAds(c echo.Context) error {
	var req listAdminAdsRequest
	if err := h.cv.BindValidate(c, &req); err != nil {
		return err
	}

	ctx := c.Request().Context()
	in := listAdminAdsRequestToInput(req)

	out, err := h.service.List(ctx, in)
	if err != nil {
		return err
	}

	resp := listResponse{Ads: h.adsToResponse(out.Ads), Total: out.Total}
	return c.JSON(http.StatusOK, resp)
}

type listAdminAdsRequest struct {
	Limit  int    `query:"limit" validate:"omitempty,gte=1,lte=50" example:"15"`
	Offset int    `query:"offset" validate:"omitempty,gte=0" example:"0"`
	SortBy string `query:"sortBy" validate:"omitempty,oneof=dateAsc dateDesc" example:"dateDesc"`

	Search   *string `query:"search" validate:"omitempty,min=2" example:"котик"`
	Status   *int32  `query:"status" validate:"omitempty,oneof=1 2 3" example:"1"`
	PetType  *int32  `query:"petType" validate:"omitempty,oneof=1 2 3" example:"2"`
	AuthorID *string `query:"authorId" validate:"omitempty,uuid" example:"123e4567-e89b-12d3-a456-426614174000"`
}

func listAdminAdsRequestToInput(req listAdminAdsRequest) entity.ListAdsInput {
	var status *entity.AdStatus
	if req.Status != nil {
		val := entity.AdStatus(*req.Status)
		status = &val
	}

	return entity.ListAdsInput{
		Limit:  req.Limit,
		Offset: req.Offset,
		SortBy: req.SortBy,

		Search:   req.Search,
		Status:   status,
		PetType:  (*entity.PetType)(req.PetType),
		AuthorID: req.AuthorID,
	}
}
