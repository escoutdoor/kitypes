package report

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/labstack/echo/v4"
)

// @Summary		List reports (Admin)
// @Description	Retrieves a paginated list of reports with filters. Requires admin privileges.
// @Tags			Admin Reports
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			limit		query		int						false	"Pagination limit"		default(10)
// @Param			offset		query		int						false	"Pagination offset"		default(0)
// @Param			status		query		string					false	"Filter by status"		Enums(pending, resolved, dismissed)
// @Param			targetType	query		string					false	"Filter by target type"	Enums(ad, user, message)
// @Param			targetId	query		string					false	"Filter by target ID (UUID)"
// @Param			reporterId	query		string					false	"Filter by reporter ID (UUID)"
// @Success		200			{object}	listReportsResponse		"Reports list"
// @Failure		400			{object}	response.ErrorResponse	"Validation error"
// @Failure		401			{object}	response.ErrorResponse	"Unauthorized"
// @Failure		403			{object}	response.ErrorResponse	"Forbidden (Not an admin)"
// @Failure		500			{object}	response.ErrorResponse	"Internal server error"
// @Router			/admin/reports [get]
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
	ReporterID *string                  `query:"reporterId" validate:"omitempty,uuid"`
}

type listReportsResponse struct {
	Reports []enrichedReportResponse `json:"reports"`
	Total   int                      `json:"total" example:"42"`
}

func listRequestToInput(req listRequest) entity.ListReportsInput {
	return entity.ListReportsInput{
		Limit:      req.Limit,
		Offset:     req.Offset,
		Status:     req.Status,
		TargetType: req.TargetType,
		TargetID:   req.TargetID,
		ReporterID: req.ReporterID,
	}
}
