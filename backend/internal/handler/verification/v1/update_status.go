package verification

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (h *handler) updateStatus(c echo.Context) error {
	requestID := c.Param(idParam)
	if err := uuid.Validate(requestID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid id param format")
	}

	var req updateStatusRequest
	if err := h.cv.BindValidate(c, &req); err != nil {
		return err
	}

	ctx := c.Request().Context()
	in := updateStatusRequestToInput(req, requestID)

	if err := h.service.UpdateStatus(ctx, in); err != nil {
		return err
	}

	return c.NoContent(http.StatusNoContent)
}

type updateStatusRequest struct {
	Status     entity.VerificationStatus `json:"status" validate:"required,oneof=approved rejected"`
	AdminNotes *string                   `json:"adminNotes" validate:"required_if=Status rejected"`
}

func updateStatusRequestToInput(req updateStatusRequest, requestID string) entity.UpdateVerificationStatusInput {
	return entity.UpdateVerificationStatusInput{
		RequestID:  requestID,
		Status:     req.Status,
		AdminNotes: req.AdminNotes,
	}
}
