package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/labstack/echo/v4"
)

// @Summary		Contact support
// @Description	Sends a support message. Authorization is optional.
// @Tags			Support
// @Accept			json
// @Produce		json
// @Param			request	body	contactRequest	true	"Support request"
// @Success		204		"No Content"
// @Failure		400		{object}	response.ErrorResponse	"Validation error"
// @Failure		429		{object}	response.ErrorResponse	"Rate limit exceeded"
// @Failure		500		{object}	response.ErrorResponse	"Internal server error"
// @Router			/support/contact [post]
func (h *handler) contact(c echo.Context) error {
	var req contactRequest
	if err := h.cv.BindValidate(c, &req); err != nil {
		return err
	}

	userID, err := httpctx.GetOptionalUserID(c)
	if err != nil {
		return err
	}
	ip := c.RealIP()

	ctx := c.Request().Context()
	in := contactRequestToInput(req, userID, ip)

	if err := h.service.SendContactMessage(ctx, in); err != nil {
		return err
	}

	return c.NoContent(http.StatusNoContent)
}

type contactRequest struct {
	Subject string `json:"subject" validate:"required,max=100" example:"Проблема з оголошенням"`
	Email   string `json:"email" validate:"required,email" example:"user@example.com"`
	Message string `json:"message" validate:"required,min=10,max=2000" example:"Опишіть проблему детально..."`
}

func contactRequestToInput(req contactRequest, userID *string, ip string) entity.SendContactInput {
	return entity.SendContactInput{
		Subject:   req.Subject,
		Email:     req.Email,
		Message:   req.Message,
		UserID:    userID,
		IPAddress: ip,
	}
}
