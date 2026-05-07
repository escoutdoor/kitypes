package ad

import (
	"context"
	"strings"
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/mimeutil"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
	"github.com/google/uuid"
)

const (
	objectKeyPrefix    = "ads/"
	defaultImageExt    = ".jpg"
	maxUploadURLsBatch = 10

	uploadURLLifetime = 15 * time.Minute
)

var allowedImageExts = map[string]struct{}{
	".jpg":  {},
	".jpeg": {},
	".png":  {},
	".webp": {},
}

func (s *Service) GenerateUploadURLs(ctx context.Context, exts []string) ([]entity.AdImageUploadTarget, error) {
	if len(exts) == 0 || len(exts) > maxUploadURLsBatch {
		return nil, apperror.ErrInvalidUploadBatchSize
	}

	out := make([]entity.AdImageUploadTarget, 0, len(exts))
	for _, rawExt := range exts {
		ext := strings.ToLower(strings.TrimSpace(rawExt))
		if ext == "" {
			ext = defaultImageExt
		}

		if _, ok := allowedImageExts[ext]; !ok {
			return nil, apperror.UnsupportedImageExtension(ext)
		}

		url, key, err := s.generateUploadURL(ctx, ext)
		if err != nil {
			return nil, errwrap.Wrap("generate upload url for ad image", err)
		}

		out = append(out, entity.AdImageUploadTarget{
			UploadURL: url,
			ImageKey:  key,
		})
	}

	return out, nil
}

func (s *Service) generateUploadURL(ctx context.Context, ext string) (string, string, error) {
	name := uuid.New().String() + ext
	key := objectKeyPrefix + name

	contentType := mimeutil.TypeByExtension(ext)
	url, err := s.s3Client.GeneratePresignedUploadURL(ctx, key, contentType, uploadURLLifetime)
	if err != nil {
		return "", "", errwrap.Wrap("generate presigned url", err)
	}

	return url, key, nil
}
