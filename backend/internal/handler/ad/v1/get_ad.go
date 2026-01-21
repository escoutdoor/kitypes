package v1

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (h *handler) getAd(c echo.Context) error {
	adID := c.Param(idParam)
	if err := uuid.Validate(adID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid id param format")
	}

	ctx := c.Request().Context()
	ad, err := h.service.GetAd(ctx, adID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	resp := getAdResponse{Ad: adToResponse(ad)}
	return c.JSON(http.StatusOK, resp)
}

type getAdResponse struct {
	Ad adResponse `json:"advertisement"`
}
