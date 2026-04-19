package v1

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
)

func (h *handler) getUploadURL(c echo.Context) error {
	var req getUploadURLRequest
	if err := h.cv.BindValidate(c, &req); err != nil {
		return err
	}
	ext := strings.ToLower(req.Ext)
	if ext == "" {
		req.Ext = ".jpg"
	}
	if !isAllowedExt(ext) {
		return echo.NewHTTPError(http.StatusBadRequest, "unsupported file extension, allowed: .jpg, .jpeg, .png, .webp")
	}

	ctx := c.Request().Context()
	url, key, err := h.service.GenerateUploadURL(ctx, req.Ext)
	if err != nil {
		return err
	}

	resp := getUploadURLResponse{UploadURL: url, AvatarKey: key}
	return c.JSON(http.StatusOK, resp)
}

type getUploadURLRequest struct {
	Ext string `query:"ext"`
}

type getUploadURLResponse struct {
	UploadURL string `json:"uploadUrl"`
	AvatarKey string `json:"avatarKey"`
}

func isAllowedExt(ext string) bool {
	allowedExts := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".webp": true,
	}

	return allowedExts[ext]
}
