package favorite

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
)

type favoriteRepository interface {
	Create(ctx context.Context, userID string, adID string) error
	Delete(ctx context.Context, userID string, adID string) error

	List(ctx context.Context, in entity.ListFavoritesInput) (entity.ListFavoritesOutput, error)
}

type adRepository interface {
	List(ctx context.Context, in entity.ListAdsInput) (entity.ListAdsOutput, error)
}

type s3Client interface {
	BuildPublicURL(key string) string
}

type Service struct {
	favoriteRepo favoriteRepository
	adRepo       adRepository

	s3Client s3Client
}

func New(favoriteRepo favoriteRepository, adRepo adRepository, s3Client s3Client) *Service {
	return &Service{
		favoriteRepo: favoriteRepo,
		adRepo:       adRepo,
		s3Client:     s3Client,
	}
}

func (s *Service) BuildPublicURL(key string) string {
	return s.s3Client.BuildPublicURL(key)
}
