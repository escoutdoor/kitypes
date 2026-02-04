package v1

import (
	"context"
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/chat"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/validator"
	"github.com/labstack/echo/v4"
	"golang.org/x/time/rate"
)

type chatService interface {
	SendMessage(ctx context.Context, in entity.Message, adID string) error
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
	chat *chat.Chat,
) {
	h := &handler{
		service: chatService,
		cv:      cv,

		publishLimiter: rate.NewLimiter(rate.Every(time.Millisecond*100), 8),
		chat:           chat,
	}
	e.Use(authMw)

	e.GET("/subscribe", h.subscribe)
	e.POST("/publish", h.publish)
}
