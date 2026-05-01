package v1

import (
	"context"
	"time"

	"github.com/coder/websocket"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	"github.com/labstack/echo/v4"
)

func (h *handler) subscribe(c echo.Context) error {
	userID, err := httpctx.GetUserID(c)
	if err != nil {
		return err
	}

	conn, err := websocket.Accept(c.Response(), c.Request(), &websocket.AcceptOptions{InsecureSkipVerify: true})
	if err != nil {
		return err
	}
	defer conn.CloseNow()

	sub := h.chat.AddSub(userID)
	defer h.chat.DeleteSub(userID, sub)

	ctx := conn.CloseRead(c.Request().Context())

	for {
		select {
		case msg := <-sub.Msgs:
			if err := writeTimeout(ctx, time.Second*5, conn, msg); err != nil {
				return err
			}

		case <-ctx.Done():
			return ctx.Err()
		}
	}
}

func writeTimeout(ctx context.Context, timeout time.Duration, c *websocket.Conn, msg []byte) error {
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	return c.Write(ctx, websocket.MessageText, msg)
}
