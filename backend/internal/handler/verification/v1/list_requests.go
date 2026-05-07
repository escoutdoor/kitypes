package verification

import (
	"context"
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
	"github.com/labstack/echo/v4"
)

func (h *handler) list(c echo.Context) error {
	var req listRequest
	if err := h.cv.BindValidate(c, &req); err != nil {
		return err
	}

	ctx := c.Request().Context()

	in := listRequestToInput(req)
	out, err := h.service.List(ctx, in)
	if err != nil {
		return err
	}

	resp, err := h.listVerificationsOutputToResponse(ctx, out.Requests, out.Total)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, resp)
}

type listRequest struct {
	Limit  int     `query:"limit" validate:"omitempty,gte=1,lte=50"`
	Offset int     `query:"offset" validate:"omitempty,gte=0"`
	Status *string `query:"status" validate:"omitempty,oneof=pending approved rejected"`
	UserID *string `query:"userId" validate:"omitempty,uuid"`
	Query  *string `query:"query" validate:"omitempty"`
}

func listRequestToInput(req listRequest) entity.ListVerificationsInput {
	var statusFilter *entity.VerificationStatus
	if req.Status != nil {
		s := entity.VerificationStatus(*req.Status)
		statusFilter = &s
	}

	return entity.ListVerificationsInput{
		Limit:  req.Limit,
		Offset: req.Offset,
		Status: statusFilter,
		UserID: req.UserID,
		Query:  req.Query,
	}
}

type listResponse struct {
	Requests []enrichedVerificationResponse `json:"requests"`
	Total    int                            `json:"total"`
}

func (h *handler) listVerificationsOutputToResponse(ctx context.Context, vrs []entity.EnrichedVerificationRequest, total int) (listResponse, error) {
	list := make([]enrichedVerificationResponse, 0, len(vrs))
	for _, vr := range vrs {
		respVer, err := h.enrichedVerificationToResponse(ctx, vr)
		if err != nil {
			return listResponse{}, errwrap.Wrap("enriched verification to response", err)
		}

		list = append(list, respVer)
	}

	return listResponse{
		Requests: list,
		Total:    total,
	}, nil
}
