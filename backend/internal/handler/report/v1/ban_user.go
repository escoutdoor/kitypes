package report

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (h *handler) banUserAndResolve(c echo.Context) error {
	reportID := c.Param(idParam)
	if err := uuid.Validate(reportID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid report id format")
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
	TargetUserID string  `json:"targetUserId" validate:"required,uuid"`
	AdminNotes   *string `json:"adminNotes" validate:"omitempty,max=1000"`
}
