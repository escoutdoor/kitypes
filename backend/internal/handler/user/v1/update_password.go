package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/labstack/echo/v4"
)

// @Summary		Update current user password
// @Description	Updates the password of the currently authenticated user. Requires current password validation.
// @Tags			Users
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			request	body	updatePasswordRequest	true	"Old and new password"
// @Success		204		"Password successfully updated (No Content)"
// @Failure		400		{object}	response.ErrorResponse	"Validation error or incorrect old password"
// @Failure		401		{object}	response.ErrorResponse	"Unauthorized"
// @Failure		500		{object}	response.ErrorResponse	"Internal server error"
// @Router			/users/me/password [patch]
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
	OldPassword string `json:"oldPassword" validate:"required,min=8,max=20" example:"OldPass123!"`
	NewPassword string `json:"newPassword" validate:"required,min=8,max=20" example:"NewStrongPass123!"`
}

func updatePasswordRequestToInput(req updatePasswordRequest, userID string) entity.UpdateUserPasswordInput {
	return entity.UpdateUserPasswordInput{
		ID: userID,

		OldPassword: req.OldPassword,
		NewPassword: req.NewPassword,
	}
}
