package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	"github.com/labstack/echo/v4"
)

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
	Subject string `json:"subject" validate:"required,max=100"`
	Email   string `json:"email" validate:"required,email"`
	Message string `json:"message" validate:"required,min=10,max=2000"`
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
