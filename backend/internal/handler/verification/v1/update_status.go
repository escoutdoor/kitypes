package verification

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// @Summary		Update verification status (Admin)
// @Description	Approves or rejects a verification request. Requires admin privileges.
// @Tags			Admin Verification
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			id		path	string				true	"Verification request ID (UUID)"
// @Param			request	body	updateStatusRequest	true	"Status update data"
// @Success		204		"No Content"
// @Failure		400		{object}	response.ErrorResponse	"Validation error or invalid UUID"
// @Failure		401		{object}	response.ErrorResponse	"Unauthorized"
// @Failure		403		{object}	response.ErrorResponse	"Forbidden (Not an admin)"
// @Failure		404		{object}	response.ErrorResponse	"Request not found"
// @Failure		409		{object}	response.ErrorResponse	"Request already processed"
// @Failure		500		{object}	response.ErrorResponse	"Internal server error"
// @Router			/admin/verifications/{id}/status [patch]
func (h *handler) updateStatus(c echo.Context) error {
	requestID := c.Param(idParam)
	if err := uuid.Validate(requestID); err != nil {
		return apperror.InvalidUUID("verification request id")
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
	Status     entity.VerificationStatus `json:"status" validate:"required,oneof=approved rejected" example:"approved"`
	AdminNotes *string                   `json:"adminNotes" validate:"required_if=Status rejected" example:"Документи не відповідають вимогам"`
}

func updateStatusRequestToInput(req updateStatusRequest, requestID string) entity.UpdateVerificationStatusInput {
	return entity.UpdateVerificationStatusInput{
		RequestID:  requestID,
		Status:     req.Status,
		AdminNotes: req.AdminNotes,
	}
}
