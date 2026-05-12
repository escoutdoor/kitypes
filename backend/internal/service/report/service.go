package report

import (
	"context"
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/database"
	"github.com/redis/go-redis/v9"
)

const (
	maxReportsPerHour = 5
	rateLimitWindow   = time.Hour
	minCommentLen     = 10
)

var rateLimitScript = redis.NewScript(`
	local current = redis.call("INCR", KEYS[1])
	if current == 1 then
		redis.call("EXPIRE", KEYS[1], ARGV[1])
	end
	return current
`)

type reportRepository interface {
	Create(ctx context.Context, in entity.CreateReportInput) error
	List(ctx context.Context, in entity.ListReportsInput) (entity.ListReportsOutput, error)
	GetByID(ctx context.Context, reportID string) (entity.EnrichedReport, error)
	UpdateStatus(ctx context.Context, in entity.UpdateReportStatusInput) error
}

type adRepository interface {
	UpdateStatus(ctx context.Context, in entity.UpdateAdStatusInput) error
	BlockAllByUserID(ctx context.Context, userID string) error
}

type userRepository interface {
	Ban(ctx context.Context, userID string) error
}

type Service struct {
	repo     reportRepository
	adRepo   adRepository
	userRepo userRepository
	redis    *redis.Client
	tx       database.TxManager
}

func New(repo reportRepository, adRepo adRepository, userRepo userRepository, rdb *redis.Client, tx database.TxManager) *Service {
	return &Service{
		repo:     repo,
		adRepo:   adRepo,
		userRepo: userRepo,
		redis:    rdb,
		tx:       tx,
	}
}
