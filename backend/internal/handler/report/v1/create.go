package report

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
	TargetType entity.ReportTargetType `json:"targetType" validate:"required,oneof=ad user message"`
	TargetID   string                  `json:"targetId" validate:"required,uuid"`
	Reason     entity.ReportReason     `json:"reason" validate:"required,oneof=spam scam inappropriate animal_cruelty other"`
	Comment    *string                 `json:"comment" validate:"omitempty,max=500"`
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
