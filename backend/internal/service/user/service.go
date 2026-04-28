package user

import (
	"context"
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
)

type userRepository interface {
	GetByEmail(ctx context.Context, email string) (entity.User, error)
	GetByID(ctx context.Context, userID string) (entity.User, error)

	Update(ctx context.Context, in entity.UpdateUserInput) (entity.User, error)
}

type s3Client interface {
	GeneratePresignedUploadURL(ctx context.Context, key string, ttl time.Duration) (string, error)
	DeleteFiles(ctx context.Context, keys []string) error

	BuildPublicURL(key string) string
}

type Service struct {
	userRepo userRepository
	s3Client s3Client
}

func New(userRepo userRepository, s3Client s3Client) *Service {
	return &Service{
		userRepo: userRepo,
		s3Client: s3Client,
	}
}
