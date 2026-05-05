package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	"github.com/labstack/echo/v4"
)

func (h *handler) updatePassword(c echo.Context) error {
	userID, err := httpctx.GetUserID(c)
	if err != nil {
		return err
	}

	var req updatePasswordRequest
	if err := h.cv.BindValidate(c, &req); err != nil {
		return err
	}

	ctx := c.Request().Context()
	in := updatePasswordRequestToInput(req, userID)

	if err := h.service.UpdatePassword(ctx, in); err != nil {
		return err
	}

	return c.NoContent(http.StatusNoContent)
}

type updatePasswordRequest struct {
	OldPassword string `json:"oldPassword" validate:"required,min=8,max=20"`
	NewPassword string `json:"newPassword" validate:"required,min=8,max=20"`
}

func updatePasswordRequestToInput(req updatePasswordRequest, userID string) entity.UpdateUserPasswordInput {
	return entity.UpdateUserPasswordInput{
		ID: userID,

		OldPassword: req.OldPassword,
		NewPassword: req.NewPassword,
	}
}
