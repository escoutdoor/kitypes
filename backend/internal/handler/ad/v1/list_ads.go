package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	"github.com/labstack/echo/v4"
)

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
	Limit  int    `query:"limit" validate:"omitempty,gte=1,lte=50"`
	Offset int    `query:"offset" validate:"omitempty,gte=0"`
	SortBy string `query:"sortBy" validate:"omitempty,oneof=dateAsc dateDesc"`

	Search *string `query:"search" validate:"omitempty,min=2"`

	Country *string `query:"country"`
	City    *string `query:"city"`

	PetType   *int32 `query:"petType" validate:"omitempty,oneof=1 2 3"`
	PetGender *int32 `query:"petGender" validate:"omitempty,oneof=1 2"`
	Status    *int32 `query:"status" validate:"omitempty,oneof=1 2"`

	MinPetAgeMonth *int32 `query:"minPetAgeMonth" validate:"omitempty,gte=0"`
	MaxPetAgeMonth *int32 `query:"maxPetAgeMonth" validate:"omitempty,gte=0"`

	VerifiedOnly *bool   `query:"verifiedOnly"`
	AuthorID     *string `query:"authorId" validate:"omitempty,uuid"`
}

type listResponse struct {
	Ads   []adResponse `json:"advertisements"`
	Total int          `json:"total"`
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
