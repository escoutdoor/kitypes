package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/labstack/echo/v4"
)

func (h *handler) listAdminUsers(c echo.Context) error {
	var req listAdminUsersRequest
	if err := h.cv.BindValidate(c, &req); err != nil {
		return err
	}

	ctx := c.Request().Context()
	in := listAdminUsersRequestToInput(req)

	out, err := h.service.List(ctx, in)
	if err != nil {
		return err
	}

	users := make([]meResponse, 0, len(out.Users))
	for _, u := range out.Users {
		users = append(users, h.meToResponse(u))
	}

	return c.JSON(http.StatusOK, listAdminUsersResponse{Users: users, Total: out.Total})
}

type listAdminUsersRequest struct {
	Limit  int     `query:"limit" validate:"omitempty,gte=1,lte=50"`
	Offset int     `query:"offset" validate:"omitempty,gte=0"`
	Search *string `query:"search" validate:"omitempty,min=2"`

	Role     *entity.UserRole `query:"role" validate:"omitempty,oneof=user volunteer shelter admin"`
	IsBanned *bool            `query:"isBanned"`
}

type listAdminUsersResponse struct {
	Users []meResponse `json:"users"`
	Total int          `json:"total"`
}

func listAdminUsersRequestToInput(req listAdminUsersRequest) entity.ListUsersInput {
	return entity.ListUsersInput{
		Limit:    req.Limit,
		Offset:   req.Offset,
		Search:   req.Search,
		Role:     req.Role,
		IsBanned: req.IsBanned,
	}
}
