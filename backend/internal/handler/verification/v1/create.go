package verification

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	"github.com/labstack/echo/v4"
)

func (h *handler) create(c echo.Context) error {
	var req createRequest
	if err := h.cv.BindValidate(c, &req); err != nil {
		return err
	}
	ctx := c.Request().Context()

	userID, err := httpctx.GetUserID(c)
	if err != nil {
		return err
	}
	currentRole, err := httpctx.GetUserRole(c)
	if err != nil {
		return err
	}

	in := createRequestToInput(req, userID, currentRole)

	verificationRequest, err := h.service.Create(ctx, in)
	if err != nil {
		return err
	}

	resp := verificationToResponse(verificationRequest)
	return c.JSON(http.StatusCreated, resp)
}

type createRequest struct {
	RequestedRole entity.UserRole `json:"requestedRole" validate:"required,oneof=volunteer shelter"`
	DocumentKeys  []string        `json:"documentKeys" validate:"required,min=1"`
}

func createRequestToInput(req createRequest, userID string, role entity.UserRole) entity.CreateVerificationRequestInput {
	return entity.CreateVerificationRequestInput{
		UserID:        userID,
		CurrentRole:   entity.UserRole(role),
		RequestedRole: req.RequestedRole,
		DocumentKeys:  req.DocumentKeys,
	}
}
