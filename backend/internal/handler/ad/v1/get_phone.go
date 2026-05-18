package v1

import (
	"net/http"

	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// @Summary		Get ad author's phone
// @Description	Retrieves the phone number of the advertisement's author.
// @Tags			Ads
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			id	path		string					true	"Ad ID (UUID)"
// @Success		200	{object}	getPhoneResponse		"Author's phone number"
// @Failure		400	{object}	response.ErrorResponse	"Invalid UUID format"
// @Failure		401	{object}	response.ErrorResponse	"Unauthorized"
// @Failure		404	{object}	response.ErrorResponse	"Ad not found or author banned"
// @Failure		500	{object}	response.ErrorResponse	"Internal server error"
// @Router			/ads/{id}/phone [get]
func (h *handler) getPhone(c echo.Context) error {
	adID := c.Param(idParam)
	if err := uuid.Validate(adID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid id param format")
	}

	ctx := c.Request().Context()
	phone, err := h.service.GetPhone(ctx, adID)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, getPhoneResponse{Phone: phone})
}

type getPhoneResponse struct {
	Phone string `json:"phone" example:"+380991234567"`
}
