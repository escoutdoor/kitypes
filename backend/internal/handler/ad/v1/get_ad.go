package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (h *handler) get(c echo.Context) error {
	adID := c.Param(idParam)
	if err := uuid.Validate(adID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid id param format")
	}

	viewerID, err := httpctx.GetOptionalUserID(c)
	if err != nil {
		return err
	}
	viewerRole, err := httpctx.GetOptionalUserRole(c)
	if err != nil {
		return err
	}

	ctx := c.Request().Context()
	ad, err := h.service.Get(ctx, adID, viewerID, viewerRole)
	if err != nil {
		return err
	}

	resp := getResponse{Ad: h.enrichedAdToResponse(ad)}
	return c.JSON(http.StatusOK, resp)
}

type getResponse struct {
	Ad enrichedAdResponse `json:"advertisement"`
}
