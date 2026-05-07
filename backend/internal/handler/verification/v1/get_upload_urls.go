package verification

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/labstack/echo/v4"
)

func (h *handler) getUploadURLs(c echo.Context) error {
	var req uploadURLsRequest
	if err := h.cv.BindValidate(c, &req); err != nil {
		return err
	}

	ctx := c.Request().Context()
	targets, err := h.service.GenerateUploadURLs(ctx, req.Extensions)
	if err != nil {
		return err
	}

	resp := verificationDocumentUploadTargetsToResponse(targets)
	return c.JSON(http.StatusOK, resp)
}

type uploadURLsRequest struct {
	Extensions []string `json:"extensions" validate:"required,min=1,max=10"`
}

type getUploadURLsResponse struct {
	Targets []uploadURLItem `json:"targets"`
}

type uploadURLItem struct {
	UploadURL   string `json:"uploadUrl"`
	DocumentKey string `json:"documentKey"`
}

func verificationDocumentUploadTargetsToResponse(items []entity.VerificationDocumentUploadTarget) getUploadURLsResponse {
	list := make([]uploadURLItem, 0, len(items))
	for _, v := range items {
		list = append(list, uploadURLItem{
			UploadURL:   v.UploadURL,
			DocumentKey: v.DocumentKey,
		})
	}

	return getUploadURLsResponse{Targets: list}
}
