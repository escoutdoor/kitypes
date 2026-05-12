package report

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (h *handler) updateStatus(c echo.Context) error {
	reportID := c.Param(idParam)
	if err := uuid.Validate(reportID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid report id format")
	}

	var req updateStatusRequest
	if err := h.cv.BindValidate(c, &req); err != nil {
		return err
	}

	ctx := c.Request().Context()
	in := updateStatusRequestToInput(req, reportID)

	if err := h.service.UpdateStatus(ctx, in); err != nil {
		return err
	}

	return c.NoContent(http.StatusNoContent)
}

type updateStatusRequest struct {
	Status     entity.ReportStatus `json:"status" validate:"required,oneof=resolved dismissed"`
	AdminNotes *string             `json:"adminNotes" validate:"omitempty,max=1000"`
}

func updateStatusRequestToInput(req updateStatusRequest, reportID string) entity.UpdateReportStatusInput {
	return entity.UpdateReportStatusInput{
		ReportID:   reportID,
		Status:     req.Status,
		AdminNotes: req.AdminNotes,
	}
}
