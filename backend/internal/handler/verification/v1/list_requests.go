package verification

import (
	"context"
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/labstack/echo/v4"
)

// @Summary		List verification requests (Admin)
// @Description	Retrieves a paginated list of verification requests with filters. Requires admin privileges.
// @Tags			Admin Verification
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			limit	query		int						false	"Pagination limit"	default(10)
// @Param			offset	query		int						false	"Pagination offset"	default(0)
// @Param			status	query		string					false	"Filter by status"	Enums(pending, approved, rejected)
// @Param			userId	query		string					false	"Filter by user ID (UUID)"
// @Param			query	query		string					false	"Search by name or email"
// @Success		200		{object}	listResponse			"Verification requests list"
// @Failure		400		{object}	response.ErrorResponse	"Validation error"
// @Failure		401		{object}	response.ErrorResponse	"Unauthorized"
// @Failure		403		{object}	response.ErrorResponse	"Forbidden (Not an admin)"
// @Failure		500		{object}	response.ErrorResponse	"Internal server error"
// @Router			/admin/verifications [get]
func (h *handler) list(c echo.Context) error {
	var req listRequest
	if err := h.cv.BindValidate(c, &req); err != nil {
		return err
	}

	ctx := c.Request().Context()

	in := listRequestToInput(req)
	out, err := h.service.List(ctx, in)
	if err != nil {
		return err
	}

	resp, err := h.listVerificationsOutputToResponse(ctx, out.Requests, out.Total)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, resp)
}

type listRequest struct {
	Limit  int     `query:"limit" validate:"omitempty,gte=1,lte=50" example:"10"`
	Offset int     `query:"offset" validate:"omitempty,gte=0" example:"0"`
	Status *string `query:"status" validate:"omitempty,oneof=pending approved rejected" example:"pending"`
	UserID *string `query:"userId" validate:"omitempty,uuid" example:"123e4567-e89b-12d3-a456-426614174000"`
	Query  *string `query:"query" validate:"omitempty" example:"anatolii"`
}

func listRequestToInput(req listRequest) entity.ListVerificationsInput {
	var statusFilter *entity.VerificationStatus
	if req.Status != nil {
		s := entity.VerificationStatus(*req.Status)
		statusFilter = &s
	}

	return entity.ListVerificationsInput{
		Limit:  req.Limit,
		Offset: req.Offset,
		Status: statusFilter,
		UserID: req.UserID,
		Query:  req.Query,
	}
}

type listResponse struct {
	Requests []enrichedVerificationResponse `json:"requests"`
	Total    int                            `json:"total" example:"42"`
}

func (h *handler) listVerificationsOutputToResponse(ctx context.Context, vrs []entity.EnrichedVerificationRequest, total int) (listResponse, error) {
	list := make([]enrichedVerificationResponse, 0, len(vrs))
	for _, vr := range vrs {
		respVer, err := h.enrichedVerificationToResponse(ctx, vr)
		if err != nil {
			return listResponse{}, errwrap.Wrap("enriched verification to response", err)
		}

		list = append(list, respVer)
	}

	return listResponse{
		Requests: list,
		Total:    total,
	}, nil
}
