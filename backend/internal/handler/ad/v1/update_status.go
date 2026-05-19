package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// @Summary		Update advertisement status (Admin)
// @Description	Updates the status of an advertisement (e.g., to Blocked). Requires admin privileges.
// @Tags			Admin Ads
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			id		path	string				true	"Ad ID (UUID)"
// @Param			request	body	updateStatusRequest	true	"New status"
// @Success		204		"Status successfully updated (No Content)"
// @Failure		400		{object}	response.ErrorResponse	"Validation error or invalid UUID format"
// @Failure		401		{object}	response.ErrorResponse	"Unauthorized"
// @Failure		403		{object}	response.ErrorResponse	"Forbidden (Not an admin)"
// @Failure		404		{object}	response.ErrorResponse	"Ad not found"
// @Failure		500		{object}	response.ErrorResponse	"Internal server error"
// @Router			/admin/ads/{id}/status [patch]
func (h *handler) updateStatus(c echo.Context) error {
	adID := c.Param(idParam)
	if err := uuid.Validate(adID); err != nil {
		return apperror.InvalidUUID("ad id")
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

type updateStatusRequest struct {
	Status entity.AdStatus `json:"status" validate:"required,oneof=1 2 3" example:"3"` // 1: Opened, 2: Closed, 3: Blocked
}

func updateAdStatusRequestToInput(req updateStatusRequest, id string) entity.UpdateAdStatusInput {
	return entity.UpdateAdStatusInput{
		ID:     id,
		Status: req.Status,
	}
}
