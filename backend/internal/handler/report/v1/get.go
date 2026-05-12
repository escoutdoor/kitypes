package report

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (h *handler) get(c echo.Context) error {
	reportID := c.Param(idParam)
	if err := uuid.Validate(reportID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid report id format")
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
