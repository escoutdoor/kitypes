package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	"github.com/labstack/echo/v4"
)

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
	AvatarKey *string `json:"avatarKey" validate:"omitempty,min=20"`

	FirstName *string `json:"firstName" validate:"omitempty,min=1,max=20"`
	LastName  *string `json:"lastName" validate:"omitempty,min=1,max=20"`

	PhoneNumber *string `json:"phoneNumber" validate:"omitempty,uaphone"`
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
