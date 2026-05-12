package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type updateStatusRequest struct {
	Status entity.AdStatus `json:"status" validate:"required,oneof=1 2 3"` // 1: Opened, 2: Closed, 3: Blocked
}

func (h *handler) updateStatus(c echo.Context) error {
	adID := c.Param(idParam)
	if err := uuid.Validate(adID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid ad id format")
	}

	var req updateStatusRequest
	if err := h.cv.BindValidate(c, &req); err != nil {
		return err
	}

	ctx := c.Request().Context()
	in := updateAdStatusRequestToInput(req, adID)

	if err := h.service.UpdateStatus(ctx, in); err != nil {
		return err
	}

	return c.NoContent(http.StatusNoContent)
}

func updateAdStatusRequestToInput(req updateStatusRequest, id string) entity.UpdateAdStatusInput {
	return entity.UpdateAdStatusInput{
		ID:     id,
		Status: req.Status,
	}
}
