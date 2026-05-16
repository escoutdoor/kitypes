package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (h *handler) updateRole(c echo.Context) error {
	userID := c.Param(idParam)
	if err := uuid.Validate(userID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid user id parameter")
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
	Role entity.UserRole `json:"role" validate:"required,oneof=user volunteer shelter admin"`
}
