package verification

import (
	"context"
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
	"github.com/labstack/echo/v4"
)

func (h *handler) listMy(c echo.Context) error {
	var req listMyRequest
	if err := h.cv.BindValidate(c, &req); err != nil {
		return err
	}

	ctx := c.Request().Context()
	userID, err := httpctx.GetUserID(c)
	if err != nil {
		return err
	}

	in := listMyRequestToInput(req, userID)
	out, err := h.service.List(ctx, in)
	if err != nil {
		return err
	}

	resp, err := h.listVerificationsOutputToMyResponse(ctx, out.Requests, out.Total)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, resp)
}

type listMyRequest struct {
	Limit  int     `query:"limit" validate:"omitempty,gte=1,lte=50"`
	Offset int     `query:"offset" validate:"omitempty,gte=0"`
	Status *string `query:"status" validate:"omitempty,oneof=pending approved rejected"`
}

func listMyRequestToInput(req listMyRequest, userID string) entity.ListVerificationsInput {
	var statusFilter *entity.VerificationStatus
	if req.Status != nil {
		s := entity.VerificationStatus(*req.Status)
		statusFilter = &s
	}

	return entity.ListVerificationsInput{
		Limit:  req.Limit,
		Offset: req.Offset,
		Status: statusFilter,
		UserID: &userID,
	}
}

type myVerificationResponse struct {
	verificationResponse
	AdminNotes   *string  `json:"adminNotes,omitempty"`
	DocumentURLs []string `json:"documentUrls"`
}

func (h *handler) listVerificationsOutputToMyResponse(ctx context.Context, vrs []entity.EnrichedVerificationRequest, total int) (listMyResponse, error) {
	list := make([]myVerificationResponse, 0, len(vrs))
	for _, vr := range vrs {
		documentURLs, err := h.service.GenerateDownloadURLs(ctx, vr.DocumentKeys)
		if err != nil {
			return listMyResponse{}, errwrap.Wrap("generate download urls for my verifications", err)
		}

		list = append(list, myVerificationResponse{
			verificationResponse: verificationToResponse(vr.VerificationRequest),
			AdminNotes:           vr.AdminNotes,
			DocumentURLs:         documentURLs,
		})
	}

	return listMyResponse{
		Requests: list,
		Total:    total,
	}, nil
}

type listMyResponse struct {
	Requests []myVerificationResponse `json:"requests"`
	Total    int                      `json:"total"`
}
