package ad

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/database"
)

type adRepository interface {
	Get(ctx context.Context, adID string) (entity.Ad, error)
	Create(ctx context.Context, in entity.Ad) (string, error)
	Delete(ctx context.Context, adID string) error
	Update(ctx context.Context, in entity.UpdateAd) (entity.Ad, error)
	List(ctx context.Context, in entity.ListAdsInput) (entity.ListAdsOutput, error)
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
