package v1

import (
	"context"
	"time"

	"encoding/base64"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/middleware"
	"github.com/google/uuid"

	"github.com/escoutdoor/kitypes/backend/internal/chat"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/validator"
	"github.com/labstack/echo/v4"
	"golang.org/x/time/rate"
)

const (
	idParam = "id"

	defaultPageLimit = 20
	maxPageLimit     = 100
)

type chatService interface {
	SendMessage(ctx context.Context, in entity.Message, adID string) error
	ListConversations(ctx context.Context, userID string, limit int, cursor string) ([]entity.EnrichedConversation, string, error)
	ListMessages(ctx context.Context, userID, convID string, limit int, cursor string) ([]entity.Message, string, error)
	GetMessage(ctx context.Context, messageID string) (entity.Message, error)
	MarkAsRead(ctx context.Context, convID string, userID string, lastReadMsgID string) error

	BuildPublicURL(key string) string
}

type handler struct {
	service chatService
	cv      *validator.CustomValidator

	chat           *chat.Chat
	publishLimiter *rate.Limiter
}

func RegisterHandlers(
	e *echo.Group,
	authMw echo.MiddlewareFunc,
	chatService chatService,
	cv *validator.CustomValidator,
	chatHub *chat.Chat,
) {
	h := &handler{
		service: chatService,
		cv:      cv,

		publishLimiter: rate.NewLimiter(rate.Every(time.Millisecond*100), 8),
		chat:           chatHub,
	}

	chatGroup := e.Group("/conversations")
	chatGroup.Use(authMw)

	chatGroup.GET("/subscribe", h.subscribe)
	chatGroup.POST("/publish", h.publish)
	chatGroup.GET("", h.listConversations)
	chatGroup.GET("/:id/messages", h.listConversationMessages)
	chatGroup.PATCH("/:id/read", h.markMessageAsRead)

	adminGroup := e.Group("/admin/messages")
	adminGroup.Use(authMw, middleware.RequireRoles(entity.RoleAdmin))
	adminGroup.GET("/:id", h.getMessage)
}

func encodePageToken(cursor string) string {
	if cursor == "" {
		return ""
	}
	return base64.URLEncoding.EncodeToString([]byte(cursor))
}

func decodePageToken(token string) (string, error) {
	if token == "" {
		return "", nil
	}
	decoded, err := base64.URLEncoding.DecodeString(token)

	if err != nil {
		return "", apperror.ErrInvalidPageToken
	}

	cursorID := string(decoded)
	if err := uuid.Validate(cursorID); err != nil {
		return "", apperror.ErrInvalidPageToken
	}

	return cursorID, nil
}
