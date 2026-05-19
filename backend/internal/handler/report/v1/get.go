package report

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// @Summary		Get report (Admin)
// @Description	Retrieves a report by ID. Requires admin privileges.
// @Tags			Admin Reports
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			id	path		string					true	"Report ID (UUID)"
// @Success		200	{object}	getReportResponse		"Report"
// @Failure		400	{object}	response.ErrorResponse	"Invalid UUID format"
// @Failure		401	{object}	response.ErrorResponse	"Unauthorized"
// @Failure		403	{object}	response.ErrorResponse	"Forbidden (Not an admin)"
// @Failure		404	{object}	response.ErrorResponse	"Report not found"
// @Failure		500	{object}	response.ErrorResponse	"Internal server error"
// @Router			/admin/reports/{id} [get]
func (h *handler) get(c echo.Context) error {
	reportID := c.Param(idParam)
	if err := uuid.Validate(reportID); err != nil {
		return apperror.InvalidUUID("report id")
	}

	ctx := c.Request().Context()

	out, err := h.service.GetByID(ctx, reportID)
	if err != nil {
		return err
	}

	resp := getReportResponse{Report: enrichedReportToResponse(out)}
	return c.JSON(http.StatusOK, resp)
}

type getReportResponse struct {
	Report enrichedReportResponse `json:"report"`
}
