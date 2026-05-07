package verification

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) GenerateDownloadURLs(ctx context.Context, keys []string) ([]string, error) {
	urls := make([]string, 0, len(keys))

	for _, key := range keys {
		url, err := s.s3Client.GeneratePresignedDownloadURL(ctx, key, downloadURLLifetime)
		if err != nil {
			return nil, errwrap.Wrap("generate presigned download url", err)
		}

		urls = append(urls, url)
	}

	return urls, nil
}
