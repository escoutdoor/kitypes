package v1

import (
	"net/http"
	"strings"

	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/labstack/echo/v4"
)

// @Summary		Get avatar upload URL
// @Description	Generates a pre-signed S3 URL to upload a new avatar.
// @Tags			Users
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			ext	query		string					false	"File extension (.jpg, .jpeg, .png, .webp)"	default(".jpg")
// @Success		200	{object}	getUploadURLResponse	"Pre-signed URL and object key"
// @Failure		400	{object}	response.ErrorResponse	"Validation error (unsupported extension)"
// @Failure		401	{object}	response.ErrorResponse	"Unauthorized"
// @Failure		500	{object}	response.ErrorResponse	"Internal server error"
// @Router			/users/upload-url [get]
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
	UploadURL string `json:"uploadUrl" example:"https://s3.eu-central-1.amazonaws.com/kitypes-bucket/avatars/..."`
	AvatarKey string `json:"avatarKey" example:"avatars/uuid.jpg"`
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
