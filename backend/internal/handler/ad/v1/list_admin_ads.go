package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/labstack/echo/v4"
)

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
	Limit  int    `query:"limit" validate:"omitempty,gte=1,lte=50"`
	Offset int    `query:"offset" validate:"omitempty,gte=0"`
	SortBy string `query:"sortBy" validate:"omitempty,oneof=dateAsc dateDesc"`

	Search   *string `query:"search" validate:"omitempty,min=2"`
	Status   *int32  `query:"status" validate:"omitempty,oneof=1 2 3"`
	PetType  *int32  `query:"petType" validate:"omitempty,oneof=1 2 3"`
	AuthorID *string `query:"authorId" validate:"omitempty,uuid"`
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
