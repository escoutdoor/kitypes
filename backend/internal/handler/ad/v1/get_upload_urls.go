package v1

import (
	"net/http"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/labstack/echo/v4"
)

type getUploadURLsRequest struct {
	Files []uploadFile `json:"files" validate:"required,min=1,max=10,dive"`
}

type uploadFile struct {
	Ext string `json:"ext"`
}

type getUploadURLsResponse struct {
	Items []uploadURLItem `json:"items"`
}

type uploadURLItem struct {
	UploadURL string `json:"uploadUrl"`
	ImageKey  string `json:"imageKey"`
}

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
