package verification

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/labstack/echo/v4"
)

// @Summary		Generate verification document upload URLs
// @Description	Generates pre-signed S3 URLs to upload verification documents (up to 10).
// @Tags			Verification
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			request	body		uploadURLsRequest		true	"Document extensions"
// @Success		200		{object}	getUploadURLsResponse	"Upload URLs and keys"
// @Failure		400		{object}	response.ErrorResponse	"Validation error or invalid extension"
// @Failure		401		{object}	response.ErrorResponse	"Unauthorized"
// @Failure		500		{object}	response.ErrorResponse	"Internal server error"
// @Router			/verifications/upload-urls [post]
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
	Extensions []string `json:"extensions" validate:"required,min=1,max=10" example:".jpg,.png,.pdf"`
}

type getUploadURLsResponse struct {
	Targets []uploadURLItem `json:"targets"`
}

type uploadURLItem struct {
	UploadURL   string `json:"uploadUrl" example:"https://s3.amazonaws.com/kitypes/verifications/1.jpg?..."`
	DocumentKey string `json:"documentKey" example:"verifications/documents/1.jpg"`
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
