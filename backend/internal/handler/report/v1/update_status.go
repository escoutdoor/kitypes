package report

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// @Summary		Update report status (Admin)
// @Description	Updates report status and optionally sends a warning email. Requires admin privileges.
// @Tags			Admin Reports
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			id		path	string				true	"Report ID (UUID)"
// @Param			request	body	updateStatusRequest	true	"Status update data"
// @Success		204		"No Content"
// @Failure		400		{object}	response.ErrorResponse	"Validation error or invalid UUID"
// @Failure		401		{object}	response.ErrorResponse	"Unauthorized"
// @Failure		403		{object}	response.ErrorResponse	"Forbidden (Not an admin)"
// @Failure		404		{object}	response.ErrorResponse	"Report not found"
// @Failure		500		{object}	response.ErrorResponse	"Internal server error"
// @Router			/admin/reports/{id}/status [patch]
func (h *handler) updateStatus(c echo.Context) error {
	reportID := c.Param(idParam)
	if err := uuid.Validate(reportID); err != nil {
		return apperror.InvalidUUID("report id")
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
	Status           entity.ReportStatus `json:"status" validate:"required,oneof=resolved dismissed" example:"resolved"`
	AdminNotes       *string             `json:"adminNotes" validate:"omitempty,max=1000" example:"Порушення правил"`
	SendWarningEmail bool                `json:"sendWarningEmail" example:"true"`
}

func updateStatusRequestToInput(req updateStatusRequest, reportID string) entity.UpdateReportStatusInput {
	return entity.UpdateReportStatusInput{
		ReportID:         reportID,
		Status:           req.Status,
		AdminNotes:       req.AdminNotes,
		SendWarningEmail: req.SendWarningEmail,
	}
}
