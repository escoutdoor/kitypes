package report

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
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

	list := make([]enrichedReportResponse, 0, len(out.Reports))
	for _, r := range out.Reports {
		list = append(list, enrichedReportToResponse(r))
	}

	resp := listReportsResponse{
		Reports: list,
		Total:   out.Total,
	}
	return c.JSON(http.StatusOK, resp)
}

type listRequest struct {
	Limit      int                      `query:"limit" validate:"omitempty,gte=1,lte=50"`
	Offset     int                      `query:"offset" validate:"omitempty,gte=0"`
	Status     *entity.ReportStatus     `query:"status" validate:"omitempty,oneof=pending resolved dismissed"`
	TargetType *entity.ReportTargetType `query:"targetType" validate:"omitempty,oneof=ad user message"`
	TargetID   *string                  `query:"targetId" validate:"omitempty,uuid"`
}

type listReportsResponse struct {
	Reports []enrichedReportResponse `json:"reports"`
	Total   int                      `json:"total"`
}

func listRequestToInput(req listRequest) entity.ListReportsInput {
	return entity.ListReportsInput{
		Limit:      req.Limit,
		Offset:     req.Offset,
		Status:     req.Status,
		TargetType: req.TargetType,
		TargetID:   req.TargetID,
	}
}
