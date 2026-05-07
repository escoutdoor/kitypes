package verification

import (
	"context"
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/database"
)

type verificationRepository interface {
	GetVerificationRequestForUpdate(ctx context.Context, requestID string) (entity.VerificationRequest, error)
	GetDocumentKeys(ctx context.Context, requestID string) ([]string, error)
	GetLatestRequestByUserID(ctx context.Context, userID string) (entity.VerificationRequest, error)
	ListVerifications(ctx context.Context, in entity.ListVerificationsInput) (entity.ListVerificationsOutput, error)

	CreateVerificationRequest(ctx context.Context, in entity.CreateVerificationRequestInput) (entity.VerificationRequest, error)
	AddDocuments(ctx context.Context, requestID string, keys []string) error

	UpdateVerificationRequest(ctx context.Context, in entity.UpdateVerificationStatusInput) error
}

type userRepository interface {
	UpdateRole(ctx context.Context, userID string, role entity.UserRole) error
}

type s3Client interface {
	GeneratePresignedDownloadURL(ctx context.Context, key string, lifetime time.Duration) (string, error)
	GeneratePresignedUploadURL(ctx context.Context, key string, contentType string, lifetime time.Duration) (string, error)

	BuildPublicURL(key string) string
}

type Service struct {
	repo      verificationRepository
	userRepo  userRepository
	txManager database.TxManager

	s3Client s3Client
}

func New(repo verificationRepository, userRepo userRepository, txManager database.TxManager, s3Client s3Client) *Service {
	return &Service{
		repo:      repo,
		userRepo:  userRepo,
		txManager: txManager,
		s3Client:  s3Client,
	}
}
