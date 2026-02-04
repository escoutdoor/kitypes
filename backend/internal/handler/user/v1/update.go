package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	"github.com/labstack/echo/v4"
)

func (h *handler) updateUser(c echo.Context) error {
	userID, err := httpctx.GetUserID(c)
	if err != nil {
		return err
	}

	req := new(updateUserRequest)
	if err := h.cv.BindValidate(c, req); err != nil {
		return err
	}

	ctx := c.Request().Context()
	in := updateUserRequestToUpdate(req, userID)

	user, err := h.service.Update(ctx, in)
	if err != nil {
		return err
	}

	resp := updateUserResponse{User: meToResponse(user)}
	return c.JSON(http.StatusOK, resp)
}

type updateUserRequest struct {
	AvatarUrl *string `json:"avatarUrl" validate:"omitempty,url"`

	FirstName *string `json:"firstName" validate:"omitempty,min=1,max=20"`
	LastName  *string `json:"lastName" validate:"omitempty,min=1,max=20"`

	Email       *string `json:"email" validate:"omitempty,email"`
	PhoneNumber *string `json:"phoneNumber" validate:"omitempty,e164"`

	Password *string `json:"password" validate:"omitempty,min=8,max=20"`
}

type updateUserResponse struct {
	User meResponse `json:"user"`
}

func updateUserRequestToUpdate(req *updateUserRequest, userID string) entity.UpdateUser {
	return entity.UpdateUser{
		ID: userID,

		AvatarUrl: req.AvatarUrl,

		FirstName: req.FirstName,
		LastName:  req.LastName,

		Email:       req.Email,
		PhoneNumber: req.PhoneNumber,

		Password: req.Password,
	}
}
