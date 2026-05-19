package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// @Summary		Update user role (Admin)
// @Description	Updates the role of a specific user. Requires admin privileges.
// @Tags			Admin Users
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			id		path	string				true	"User ID (UUID)"
// @Param			request	body	updateRoleRequest	true	"New role"
// @Success		204		"Role successfully updated (No Content)"
// @Failure		400		{object}	response.ErrorResponse	"Validation error or invalid UUID format"
// @Failure		401		{object}	response.ErrorResponse	"Unauthorized"
// @Failure		403		{object}	response.ErrorResponse	"Forbidden (Not an admin)"
// @Failure		404		{object}	response.ErrorResponse	"User not found"
// @Failure		500		{object}	response.ErrorResponse	"Internal server error"
// @Router			/admin/users/{id}/role [patch]
func (h *handler) updateRole(c echo.Context) error {
	userID := c.Param(idParam)
	if err := uuid.Validate(userID); err != nil {
		return apperror.InvalidUUID("user id")
	}

	var req updateRoleRequest
	if err := h.cv.BindValidate(c, &req); err != nil {
		return err
	}

	ctx := c.Request().Context()
	if err := h.service.UpdateRole(ctx, userID, req.Role); err != nil {
		return err
	}

	return c.NoContent(http.StatusNoContent)
}

type updateRoleRequest struct {
	Role entity.UserRole `json:"role" validate:"required,oneof=user volunteer shelter admin" example:"volunteer"`
}
