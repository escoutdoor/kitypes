package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/labstack/echo/v4"
)

func (h *handler) updateEmail(c echo.Context) error {
	userID, err := httpctx.GetUserID(c)
	if err != nil {
		return err
	}

	var req updateEmailRequest
	if err := h.cv.BindValidate(c, &req); err != nil {
		return err
	}

	ctx := c.Request().Context()
	in := updateEmailRequestToInput(req, userID)

	if err := h.service.UpdateEmail(ctx, in); err != nil {
		return err
	}

	return c.NoContent(http.StatusNoContent)
}

type updateEmailRequest struct {
	Email    string `json:"email" validate:"required,email" example:"new-email@example.com"`
	Password string `json:"password" validate:"required,min=8,max=20" example:"StrongPass123!"`
}

func updateEmailRequestToInput(req updateEmailRequest, userID string) entity.UpdateUserEmailInput {
	return entity.UpdateUserEmailInput{
		ID: userID,

		NewEmail: req.Email,
		Password: req.Password,
	}
}
