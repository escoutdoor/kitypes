package v1

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

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
	Phone string `json:"phone"`
}
