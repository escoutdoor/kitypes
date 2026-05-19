package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/labstack/echo/v4"
)

// @Summary		List all users (Admin)
// @Description	Retrieves a paginated list of all users with optional filtering. Requires admin privileges.
// @Tags			Admin Users
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			limit		query		int						false	"Pagination limit"	default(10)
// @Param			offset		query		int						false	"Pagination offset"	default(0)
// @Param			search		query		string					false	"Search by name or email"
// @Param			id			query		string					false	"Filter by Exact User ID"
// @Param			role		query		string					false	"Filter by role"	Enums(user, volunteer, shelter, admin)
// @Param			isBanned	query		boolean					false	"Filter by banned status"
// @Success		200			{object}	listAdminUsersResponse	"List of users"
// @Failure		400			{object}	response.ErrorResponse	"Validation error"
// @Failure		401			{object}	response.ErrorResponse	"Unauthorized"
// @Failure		403			{object}	response.ErrorResponse	"Forbidden (Not an admin)"
// @Failure		500			{object}	response.ErrorResponse	"Internal server error"
// @Router			/admin/users [get]
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

	ID       *string          `query:"id" validate:"omitempty,uuid"`
	Role     *entity.UserRole `query:"role" validate:"omitempty,oneof=user volunteer shelter admin"`
	IsBanned *bool            `query:"isBanned"`
}

type listAdminUsersResponse struct {
	Users []meResponse `json:"users"`
	Total int          `json:"total" example:"42"`
}

func listAdminUsersRequestToInput(req listAdminUsersRequest) entity.ListUsersInput {
	return entity.ListUsersInput{
		Limit:    req.Limit,
		Offset:   req.Offset,
		Search:   req.Search,
		ID:       req.ID,
		Role:     req.Role,
		IsBanned: req.IsBanned,
	}
}
