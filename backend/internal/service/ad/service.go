package ad

import (
	"context"
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/database"
	"github.com/escoutdoor/kitypes/backend/pkg/logger"
)

type adRepository interface {
	Get(ctx context.Context, adID string, viewerID *string) (entity.Ad, error)
	Create(ctx context.Context, in entity.CreateAdInput) (string, error)
	Delete(ctx context.Context, adID string) error
	Update(ctx context.Context, in entity.UpdateAdInput) error
	UpdateStatus(ctx context.Context, in entity.UpdateAdStatusInput) error
	List(ctx context.Context, in entity.ListAdsInput) (entity.ListAdsOutput, error)

	AddImages(ctx context.Context, adID string, keys []string) error
	GetImageKeys(ctx context.Context, adID string) ([]string, error)
	DeleteImages(ctx context.Context, adID string) error
}

type userRepository interface {
	GetByID(ctx context.Context, userID string) (entity.User, error)
}

type reportRepository interface {
	GetLastResolvedReason(ctx context.Context, targetID string) (*string, error)
}

type s3Client interface {
	GeneratePresignedUploadURL(ctx context.Context, key, contentType string, lifetime time.Duration) (string, error)
	BuildPublicURL(key string) string
	DeleteFiles(ctx context.Context, keys []string) error
}

type Service struct {
	adRepo     adRepository
	userRepo   userRepository
	reportRepo reportRepository
	txManager  database.TxManager
	s3Client   s3Client
}

func New(
	adRepo adRepository,
	userRepo userRepository,
	reportRepo reportRepository,
	txManager database.TxManager,
	s3Client s3Client,
) *Service {
	return &Service{
		adRepo:     adRepo,
		userRepo:   userRepo,
		reportRepo: reportRepo,
		txManager:  txManager,
		s3Client:   s3Client,
	}
}

func (s *Service) deleteImages(keys []string) {
	bgCtx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	if err := s.s3Client.DeleteFiles(bgCtx, keys); err != nil {
		logger.ErrorKV(bgCtx, "failed to delete images",
			"image_keys: ", keys,
			"error: ", err,
		)
	}
}
