package v1

import (
	"net/http"
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (h *handler) listConversationMessages(c echo.Context) error {
	userID, err := httpctx.GetUserID(c)
	if err != nil {
		return err
	}

	convID := c.Param(idParam)
	if err := uuid.Validate(convID); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid id param format")
	}

	req := new(listConversationMessagesRequest)
	if err := h.cv.BindValidate(c, req); err != nil {
		return err
	}

	limit := req.PageSize
	switch {
	case limit <= 0:
		limit = defaultPageLimit
	case limit >= maxPageLimit:
		limit = maxPageLimit
	}

	cursor, err := decodePageToken(req.PageToken)
	if err != nil {
		return err
	}

	msgs, nextCursor, err := h.service.ListMessages(c.Request().Context(), userID, convID, limit, cursor)
	if err != nil {
		return err
	}

	resp := messagesToHistoryResponse(msgs, nextCursor)
	return c.JSON(http.StatusOK, resp)
}

func messagesToHistoryResponse(msgs []entity.Message, nextCursor string) messagesHistoryResponse {
	list := make([]messageResponse, 0, len(msgs))
	for _, m := range msgs {
		list = append(list, messageToResponse(m))
	}

	return messagesHistoryResponse{
		Messages:      list,
		NextPageToken: encodePageToken(nextCursor),
	}
}

func messageToResponse(msg entity.Message) messageResponse {
	return messageResponse{
		ID:             msg.ID,
		ConversationID: msg.ConversationID,
		SenderID:       msg.SenderID,
		Content:        msg.Content,
		IsRead:         msg.IsRead,
		CreatedAt:      msg.CreatedAt,
	}
}

type messageResponse struct {
	ID             string `json:"id"`
	ConversationID string `json:"conversationId"`
	SenderID       string `json:"senderId"`
	Content        string `json:"content"`
	IsRead         bool   `json:"isRead"`

	CreatedAt time.Time `json:"createdAt"`
}

type listConversationMessagesRequest struct {
	PageSize  int    `query:"pageSize" validate:"omitempty,gte=1,lte=100"`
	PageToken string `query:"pageToken"`
}

type messagesHistoryResponse struct {
	Messages      []messageResponse `json:"messages"`
	NextPageToken string            `json:"nextPageToken,omitempty"`
}
