package report

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// @Summary		Ban user and resolve report (Admin)
// @Description	Bans a user and resolves the report. Requires admin privileges.
// @Tags			Admin Reports
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			id		path	string			true	"Report ID (UUID)"
// @Param			request	body	banUserRequest	true	"Target user ID and optional admin notes"
// @Success		204		"No Content"
// @Failure		400		{object}	response.ErrorResponse	"Validation error or invalid UUID"
// @Failure		401		{object}	response.ErrorResponse	"Unauthorized"
// @Failure		403		{object}	response.ErrorResponse	"Forbidden (Not an admin)"
// @Failure		404		{object}	response.ErrorResponse	"Report or user not found"
// @Failure		500		{object}	response.ErrorResponse	"Internal server error"
// @Router			/admin/reports/{id}/ban-user [post]
func (h *handler) banUserAndResolve(c echo.Context) error {
	reportID := c.Param(idParam)
	if err := uuid.Validate(reportID); err != nil {
		return apperror.InvalidUUID("report id")
	}

	var req banUserRequest
	if err := h.cv.BindValidate(c, &req); err != nil {
		return err
	}

	ctx := c.Request().Context()
	if err := h.service.BanUserAndResolveReport(ctx, reportID, req.TargetUserID, req.AdminNotes); err != nil {
		return err
	}

	return c.NoContent(http.StatusNoContent)
}

type banUserRequest struct {
	TargetUserID string  `json:"targetUserId" validate:"required,uuid" example:"987fcdeb-51a2-43d7-9012-3456789abcde"`
	AdminNotes   *string `json:"adminNotes" validate:"omitempty,max=1000" example:"Порушення правил"`
}
