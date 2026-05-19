package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// @Summary		Get ad details
// @Description	Retrieves detailed information about an advertisement. Optional authorization returns "isFavorite" status.
// @Tags			Ads
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			id	path		string					true	"Ad ID (UUID)"
// @Success		200	{object}	getResponse				"Advertisement details"
// @Failure		400	{object}	response.ErrorResponse	"Invalid UUID format"
// @Failure		404	{object}	response.ErrorResponse	"Advertisement not found or blocked"
// @Failure		500	{object}	response.ErrorResponse	"Internal server error"
// @Router			/ads/{id} [get]
func (h *handler) get(c echo.Context) error {
	adID := c.Param(idParam)
	if err := uuid.Validate(adID); err != nil {
		return apperror.InvalidUUID("ad id")
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
