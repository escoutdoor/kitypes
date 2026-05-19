package report

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// @Summary		Block ad and resolve report (Admin)
// @Description	Blocks an ad and resolves the report. Requires admin privileges.
// @Tags			Admin Reports
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			id		path	string			true	"Report ID (UUID)"
// @Param			request	body	blockAdRequest	true	"Ad ID and optional admin notes"
// @Success		204		"No Content"
// @Failure		400		{object}	response.ErrorResponse	"Validation error or invalid UUID"
// @Failure		401		{object}	response.ErrorResponse	"Unauthorized"
// @Failure		403		{object}	response.ErrorResponse	"Forbidden (Not an admin)"
// @Failure		404		{object}	response.ErrorResponse	"Report or ad not found"
// @Failure		500		{object}	response.ErrorResponse	"Internal server error"
// @Router			/admin/reports/{id}/block-ad [post]
func (h *handler) blockAdAndResolve(c echo.Context) error {
	reportID := c.Param(idParam)
	if err := uuid.Validate(reportID); err != nil {
		return apperror.InvalidUUID("report id")
	}

	var req blockAdRequest
	if err := h.cv.BindValidate(c, &req); err != nil {
		return err
	}

	ctx := c.Request().Context()
	if err := h.service.BlockAdAndResolveReport(ctx, reportID, req.AdID, req.AdminNotes); err != nil {
		return err
	}

	return c.NoContent(http.StatusNoContent)
}

type blockAdRequest struct {
	AdID       string  `json:"adId" validate:"required,uuid" example:"111e2222-e33b-44d3-a456-426614174000"`
	AdminNotes *string `json:"adminNotes" validate:"omitempty,max=1000" example:"Порушення правил"`
}
