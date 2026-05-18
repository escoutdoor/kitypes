package support

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	maxSupportRequestsPerHour = 2
	rateLimitWindow           = time.Hour
)

var rateLimitScript = redis.NewScript(`
	local current = redis.call("INCR", KEYS[1])
	if current == 1 then
		redis.call("EXPIRE", KEYS[1], ARGV[1])
	end
	return current
`)

type sesClient interface {
	SendEmail(ctx context.Context, to, subject, htmlBody string) error
}

type Service struct {
	redis        *redis.Client
	sesClient    sesClient
	supportEmail string
}

func New(rdb *redis.Client, sesClient sesClient, supportEmail string) *Service {
	return &Service{
		redis:        rdb,
		sesClient:    sesClient,
		supportEmail: supportEmail,
	}
}
