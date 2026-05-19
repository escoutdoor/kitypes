package report

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/labstack/echo/v4"
)

// @Summary		Create report
// @Description	Submits a report against ad/user/message.
// @Tags			Reports
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			request	body	createRequest	true	"Report data"
// @Success		201		"No Content"
// @Failure		400		{object}	response.ErrorResponse	"Validation error"
// @Failure		401		{object}	response.ErrorResponse	"Unauthorized"
// @Failure		409		{object}	response.ErrorResponse	"Report already exists"
// @Failure		429		{object}	response.ErrorResponse	"Rate limit exceeded"
// @Failure		500		{object}	response.ErrorResponse	"Internal server error"
// @Router			/reports [post]
func (h *handler) create(c echo.Context) error {
	var req createRequest
	if err := h.cv.BindValidate(c, &req); err != nil {
		return err
	}

	userID, err := httpctx.GetUserID(c)
	if err != nil {
		return err
	}

	ctx := c.Request().Context()
	in := createRequestToInput(req, userID)

	if err := h.service.Create(ctx, in); err != nil {
		return err
	}

	return c.NoContent(http.StatusCreated)
}

type createRequest struct {
	TargetType entity.ReportTargetType `json:"targetType" validate:"required,oneof=ad user message" example:"ad"`
	TargetID   string                  `json:"targetId" validate:"required,uuid" example:"111e2222-e33b-44d3-a456-426614174000"`
	Reason     entity.ReportReason     `json:"reason" validate:"required,oneof=spam scam inappropriate animal_cruelty other" example:"spam"`
	Comment    *string                 `json:"comment" validate:"omitempty,max=500" example:"Підозрілий контент"`
}

func createRequestToInput(req createRequest, userID string) entity.CreateReportInput {
	return entity.CreateReportInput{
		ReporterID: userID,
		TargetType: req.TargetType,
		TargetID:   req.TargetID,
		Reason:     req.Reason,
		Comment:    req.Comment,
	}
}
