package ad

import (
	"context"
	"time"

	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
	"github.com/google/uuid"
)

const (
	objectKeyPrefix = "ads/"
)

func (s *Service) GenerateUploadURL(ctx context.Context, ext string) (string, string, error) {
	name := uuid.New().String() + ext
	key := objectKeyPrefix + name

	url, err := s.s3Client.GeneratePresignedUploadURL(ctx, key, 15*time.Minute)
	if err != nil {
		return "", "", errwrap.Wrap("generate presigned url", err)
	}

	return url, key, nil
}
