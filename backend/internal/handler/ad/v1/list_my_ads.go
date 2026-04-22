package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	"github.com/labstack/echo/v4"
)

func (h *handler) listMyAds(c echo.Context) error {
	var req listMyAdsRequest
	if err := h.cv.BindValidate(c, &req); err != nil {
		return err
	}

	ctx := c.Request().Context()

	userID, err := httpctx.GetUserID(c)
	if err != nil {
		return err
	}

	in := listMyAdsRequestToInput(req, userID)
	in.AuthorID = &userID

	out, err := h.service.List(ctx, in)
	if err != nil {
		return err
	}

	resp := listMyAdsResponse{Ads: h.adsToResponse(out.Ads), Total: out.Total}
	return c.JSON(http.StatusOK, resp)
}

type listMyAdsRequest struct {
	Limit  int    `query:"limit" validate:"omitempty,gte=1,lte=50"`
	Offset int    `query:"offset" validate:"omitempty,gte=0"`
	SortBy string `query:"sortBy" validate:"omitempty,oneof=dateAsc dateDesc"`

	Search *string `query:"search" validate:"omitempty,min=2"`
	Status *int32  `query:"status" validate:"omitempty,oneof=1 2"`
}

type listMyAdsResponse struct {
	Ads   []adResponse `json:"advertisements"`
	Total int          `json:"total"`
}

func listMyAdsRequestToInput(req listMyAdsRequest, userID string) entity.ListAdsInput {
	return entity.ListAdsInput{
		Limit:  req.Limit,
		Offset: req.Offset,
		SortBy: req.SortBy,

		AuthorID: &userID,

		Search: req.Search,
		Status: (*entity.AdStatus)(req.Status),
	}
}
