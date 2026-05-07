package verification

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) List(ctx context.Context, in entity.ListVerificationsInput) (entity.ListVerificationsOutput, error) {
	out, err := s.repo.ListVerifications(ctx, in)
	if err != nil {
		return entity.ListVerificationsOutput{}, errwrap.Wrap("list verifications from repo", err)
	}

	return out, nil
}

func (s *Service) BuildPublicURL(key string) string {
	return s.s3Client.BuildPublicURL(key)
}
