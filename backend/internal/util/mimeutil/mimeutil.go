package mimeutil

import "strings"

func TypeByExtension(ext string) string {
	ext = strings.ToLower(strings.TrimSpace(ext))

	switch ext {
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".webp":
		return "image/webp"
	case ".pdf":
		return "application/pdf"
	default:
		return "application/octet-stream"
	}
}
