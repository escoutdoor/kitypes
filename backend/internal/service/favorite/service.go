package favorite

import (
	"context"
)

type favoriteRepository interface {
	Create(ctx context.Context, userID string, adID string) error
	Delete(ctx context.Context, userID string, adID string) error
}

type Service struct {
	favoriteRepo favoriteRepository
}

func New(favoriteRepo favoriteRepository) *Service {
	return &Service{
		favoriteRepo: favoriteRepo,
	}
}
