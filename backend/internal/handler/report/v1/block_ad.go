package report

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (h *handler) blockAdAndResolve(c echo.Context) error {
	reportID := c.Param(idParam)
	if err := uuid.Validate(reportID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid report id format")
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
	AdID       string  `json:"adId" validate:"required,uuid"`
	AdminNotes *string `json:"adminNotes" validate:"omitempty,max=1000"`
}
