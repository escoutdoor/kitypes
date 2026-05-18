package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/labstack/echo/v4"
)

// @Summary		Update current user profile
// @Description	Updates the profile information of the currently authenticated user.
// @Tags			Users
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			request	body		updateRequest			true	"Data to update"
// @Success		200		{object}	updateResponse			"Updated user profile"
// @Failure		400		{object}	response.ErrorResponse	"Validation error"
// @Failure		401		{object}	response.ErrorResponse	"Unauthorized"
// @Failure		409		{object}	response.ErrorResponse	"Phone number already exists"
// @Failure		500		{object}	response.ErrorResponse	"Internal server error"
// @Router			/users/me [patch]
func (h *handler) update(c echo.Context) error {
	userID, err := httpctx.GetUserID(c)
	if err != nil {
		return err
	}

	var req updateRequest
	if err := h.cv.BindValidate(c, &req); err != nil {
		return err
	}

	ctx := c.Request().Context()
	in := updateRequestToInput(req, userID)

	user, err := h.service.Update(ctx, in)
	if err != nil {
		return err
	}

	resp := updateResponse{User: h.meToResponse(user)}
	return c.JSON(http.StatusOK, resp)
}

type updateRequest struct {
	AvatarKey *string `json:"avatarKey" validate:"omitempty,min=20" example:"avatars/123e4567-e89b-12d3-a456-426614174000.jpg"`

	FirstName   *string `json:"firstName" validate:"omitempty,min=1,max=20" example:"Anatolii"`
	LastName    *string `json:"lastName" validate:"omitempty,min=1,max=20" example:"Vovk"`
	PhoneNumber *string `json:"phoneNumber" validate:"omitempty,uaphone" example:"+380991234567"`
}

type updateResponse struct {
	User meResponse `json:"user"`
}

func updateRequestToInput(req updateRequest, userID string) entity.UpdateUserInput {
	return entity.UpdateUserInput{
		ID: userID,

		AvatarKey: req.AvatarKey,

		FirstName: req.FirstName,
		LastName:  req.LastName,

		PhoneNumber: req.PhoneNumber,
	}
}
