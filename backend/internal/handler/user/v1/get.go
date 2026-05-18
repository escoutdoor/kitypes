package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/labstack/echo/v4"
)

// @Summary		Get current user profile
// @Description	Retrieves the full profile of the currently authenticated user.
// @Tags			Users
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Success		200	{object}	getResponse				"User profile data"
// @Failure		401	{object}	response.ErrorResponse	"Unauthorized"
// @Failure		500	{object}	response.ErrorResponse	"Internal server error"
// @Router			/users/me [get]
func (h *handler) get(c echo.Context) error {
	userID, err := httpctx.GetUserID(c)
	if err != nil {
		return err
	}

	ctx := c.Request().Context()
	user, err := h.service.GetByID(ctx, userID)
	if err != nil {
		return err
	}

	resp := getResponse{User: h.meToResponse(user)}
	return c.JSON(http.StatusOK, resp)
}

type getResponse struct {
	User meResponse `json:"user"`
}
