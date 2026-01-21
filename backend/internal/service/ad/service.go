package ad

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/database"
)

type adRepository interface {
	GetAd(ctx context.Context, adID string) (entity.Ad, error)
	CreateAd(ctx context.Context, in CreateAdInput) (string, error)
	DeleteAd(ctx context.Context, adID string) error
	UpdateAd(ctx context.Context, in UpdateAdInput) error
	ListAds(ctx context.Context, in ListAdsInput) ([]entity.Ad, int, error)
}

type Service struct {
	adRepo    adRepository
	txManager database.TxManager
}

func New(adRepo adRepository, txManager database.TxManager) *Service {
	return &Service{
		adRepo:    adRepo,
		txManager: txManager,
	}
}
