package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/labstack/echo/v4"
)

// @Summary		Generate ad image upload URLs
// @Description	Generates pre-signed S3 URLs to upload up to 10 images for an advertisement.
// @Tags			Ads
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			request	body		getUploadURLsRequest	true	"Array of file extensions"
// @Success		200		{object}	getUploadURLsResponse	"Pre-signed URLs and object keys"
// @Failure		400		{object}	response.ErrorResponse	"Validation error or invalid extension"
// @Failure		401		{object}	response.ErrorResponse	"Unauthorized"
// @Failure		500		{object}	response.ErrorResponse	"Internal server error"
// @Router			/ads/upload-urls [post]
func (h *handler) getUploadURLs(c echo.Context) error {
	var req getUploadURLsRequest
	if err := h.cv.BindValidate(c, &req); err != nil {
		return err
	}

	exts := make([]string, 0, len(req.Files))
	for _, f := range req.Files {
		exts = append(exts, f.Ext)
	}

	items, err := h.service.GenerateUploadURLs(c.Request().Context(), exts)
	if err != nil {
		return err
	}

	resp := adImageUploadTargetsToResponse(items)
	return c.JSON(http.StatusOK, resp)
}

type getUploadURLsRequest struct {
	Files []uploadFile `json:"files" validate:"required,min=1,max=10,dive"`
}

type uploadFile struct {
	Ext string `json:"ext" example:".jpg"`
}

type getUploadURLsResponse struct {
	Items []uploadURLItem `json:"items"`
}

type uploadURLItem struct {
	UploadURL string `json:"uploadUrl" example:"https://s3.amazonaws.com/kitypes/ads/123e4567.jpg?X-Amz-Algorithm=..."`
	ImageKey  string `json:"imageKey" example:"ads/123e4567.jpg"`
}

func adImageUploadTargetsToResponse(items []entity.AdImageUploadTarget) getUploadURLsResponse {
	list := make([]uploadURLItem, 0, len(items))
	for _, v := range items {
		list = append(list, uploadURLItem{
			UploadURL: v.UploadURL,
			ImageKey:  v.ImageKey,
		})
	}

	return getUploadURLsResponse{Items: list}
}
