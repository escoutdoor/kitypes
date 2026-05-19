package verification

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/labstack/echo/v4"
)

// @Summary		Create verification request
// @Description	Submits a verification request for volunteer or shelter role.
// @Tags			Verification
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			request	body		createRequest			true	"Verification request data"
// @Success		201		{object}	verificationResponse	"Created verification request"
// @Failure		400		{object}	response.ErrorResponse	"Validation error or invalid role"
// @Failure		401		{object}	response.ErrorResponse	"Unauthorized"
// @Failure		409		{object}	response.ErrorResponse	"Request already exists or user already verified"
// @Failure		500		{object}	response.ErrorResponse	"Internal server error"
// @Router			/verifications [post]
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
	RequestedRole entity.UserRole `json:"requestedRole" validate:"required,oneof=volunteer shelter" example:"volunteer"`
	DocumentKeys  []string        `json:"documentKeys" validate:"required,min=1" example:"verifications/documents/1.jpg,verifications/documents/2.jpg"`
}

func createRequestToInput(req createRequest, userID string, role entity.UserRole) entity.CreateVerificationRequestInput {
	return entity.CreateVerificationRequestInput{
		UserID:        userID,
		CurrentRole:   entity.UserRole(role),
		RequestedRole: req.RequestedRole,
		DocumentKeys:  req.DocumentKeys,
	}
}
