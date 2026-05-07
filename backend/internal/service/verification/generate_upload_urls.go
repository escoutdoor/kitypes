package verification

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
	documentsKeyPrefix = "verifications/documents/"
	defaultDocumentExt = ".jpg"
	maxUploadURLsBatch = 10

	uploadURLLifetime   = 15 * time.Minute
	downloadURLLifetime = 1 * time.Hour
)

var allowedDocumentExts = map[string]struct{}{
	".jpg":  {},
	".jpeg": {},
	".png":  {},
	".webp": {},
	".pdf":  {},
}

func (s *Service) GenerateUploadURLs(ctx context.Context, exts []string) ([]entity.VerificationDocumentUploadTarget, error) {
	if len(exts) == 0 || len(exts) > maxUploadURLsBatch {
		return nil, apperror.ErrInvalidUploadBatchSize
	}

	out := make([]entity.VerificationDocumentUploadTarget, 0, len(exts))
	for _, rawExt := range exts {
		ext := strings.ToLower(strings.TrimSpace(rawExt))
		if ext == "" {
			ext = defaultDocumentExt
		}

		if _, ok := allowedDocumentExts[ext]; !ok {
			return nil, apperror.UnsupportedDocumentExtension(ext)
		}

		url, key, err := s.generateUploadURL(ctx, ext)
		if err != nil {
			return nil, errwrap.Wrap("generate upload url for verification document", err)
		}

		out = append(out, entity.VerificationDocumentUploadTarget{
			UploadURL:   url,
			DocumentKey: key,
		})
	}

	return out, nil
}

func (s *Service) generateUploadURL(ctx context.Context, ext string) (string, string, error) {
	name := uuid.New().String() + ext
	key := documentsKeyPrefix + name

	contentType := mimeutil.TypeByExtension(ext)

	url, err := s.s3Client.GeneratePresignedUploadURL(ctx, key, contentType, uploadURLLifetime)
	if err != nil {
		return "", "", errwrap.Wrap("generate presigned url", err)
	}

	return url, key, nil
}
