package v1

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (h *handler) getPhone(c echo.Context) error {
	userID := c.Param(idParam)
	if err := uuid.Validate(userID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid user id parameter")
	}

	ctx := c.Request().Context()
	phone, err := h.service.GetUserPhone(ctx, userID)
	if err != nil {
		return err
	}

	resp := getPhoneResponse{Phone: phone}
	return c.JSON(http.StatusOK, resp)
}

type getPhoneResponse struct {
	Phone string `json:"phone"`
}
