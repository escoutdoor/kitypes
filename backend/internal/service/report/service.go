package report

import (
	"context"
	"fmt"
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/template"
	"github.com/escoutdoor/kitypes/backend/pkg/database"
	"github.com/escoutdoor/kitypes/backend/pkg/logger"
	"github.com/redis/go-redis/v9"
)

const (
	maxReportsPerHour = 5
	rateLimitWindow   = time.Hour
	minCommentLen     = 10

	warningSubjectEmail = "Попередження | KityPes"
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

type reportRepository interface {
	Create(ctx context.Context, in entity.CreateReportInput) error
	List(ctx context.Context, in entity.ListReportsInput) (entity.ListReportsOutput, error)
	GetByID(ctx context.Context, reportID string) (entity.EnrichedReport, error)
	UpdateStatus(ctx context.Context, in entity.UpdateReportStatusInput) error
}

type adRepository interface {
	UpdateStatus(ctx context.Context, in entity.UpdateAdStatusInput) error
	BlockAllByUserID(ctx context.Context, userID string) error
	Get(ctx context.Context, adID string, viewerID *string) (entity.Ad, error)
}

type userRepository interface {
	Ban(ctx context.Context, userID string) error
	GetByID(ctx context.Context, userID string) (entity.User, error)
}

type messageRepository interface {
	GetByID(ctx context.Context, messageID string) (entity.Message, error)
}

type Service struct {
	repo        reportRepository
	adRepo      adRepository
	userRepo    userRepository
	messageRepo messageRepository
	redis       *redis.Client
	sesClient   sesClient
	tx          database.TxManager
}

func New(
	repo reportRepository,
	adRepo adRepository,
	userRepo userRepository,
	messageRepo messageRepository,
	rdb *redis.Client,
	sesClient sesClient,
	tx database.TxManager,
) *Service {
	return &Service{
		repo:        repo,
		adRepo:      adRepo,
		userRepo:    userRepo,
		messageRepo: messageRepo,
		redis:       rdb,
		sesClient:   sesClient,
		tx:          tx,
	}
}

func (s *Service) sendWarningEmailAsync(bgCtx context.Context, reportID string, notes string) {
	ctx, cancel := context.WithTimeout(bgCtx, 15*time.Second)
	defer cancel()

	report, err := s.repo.GetByID(ctx, reportID)
	if err != nil {
		logger.ErrorKV(ctx, "failed to get report for warning email", "err", err.Error())
		return
	}

	targetUserID, targetContext := s.resolveTargetContext(ctx, report)
	if targetUserID == "" {
		return
	}

	user, err := s.userRepo.GetByID(ctx, targetUserID)
	if err != nil || user.IsBanned {
		return
	}

	htmlBody, err := template.RenderWarning(template.WarningData{
		TargetContext: targetContext,
		AdminNotes:    notes,
	})
	if err != nil {
		logger.ErrorKV(ctx, "failed to render warning email template", "err", err.Error())
		return
	}

	if err := s.sesClient.SendEmail(ctx, user.Email, warningSubjectEmail, htmlBody); err != nil {
		logger.ErrorKV(ctx, "failed to send warning email via SES", "err", err.Error())
	}
}

func (s *Service) resolveTargetContext(ctx context.Context, report entity.EnrichedReport) (string, string) {
	switch report.TargetType {
	case entity.TargetTypeUser:
		return report.TargetID, "Ваш публічний профіль"

	case entity.TargetTypeAd:
		ad, err := s.adRepo.Get(ctx, report.TargetID, nil)
		if err == nil {
			return ad.AuthorID, fmt.Sprintf("Оголошення: «%s»", ad.Title)
		}

	case entity.TargetTypeMessage:
		msg, err := s.messageRepo.GetByID(ctx, report.TargetID)
		if err == nil {
			runes := []rune(msg.Content)
			contentSnippet := msg.Content
			if len(runes) > 50 {
				contentSnippet = fmt.Sprintf("%s...", string(runes[:47]))
			}

			return msg.SenderID, fmt.Sprintf("Повідомлення в чаті: «%s»", contentSnippet)
		}
	}

	return "", ""
}
