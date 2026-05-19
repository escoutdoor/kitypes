package v1

import (
	"net/http"
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/apperror"
	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// @Summary		List conversation messages
// @Description	Retrieves paginated messages for a specific conversation.
// @Tags			Chat
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			id			path		string					true	"Conversation ID (UUID)"
// @Param			pageSize	query		int						false	"Items per page (1-100)"	default(20)
// @Param			pageToken	query		string					false	"Pagination token from previous response"
// @Success		200			{object}	messagesHistoryResponse	"Messages history"
// @Failure		400			{object}	response.ErrorResponse	"Invalid UUID or invalid page token"
// @Failure		401			{object}	response.ErrorResponse	"Unauthorized"
// @Failure		403			{object}	response.ErrorResponse	"Forbidden (not a participant)"
// @Failure		404			{object}	response.ErrorResponse	"Conversation not found"
// @Failure		500			{object}	response.ErrorResponse	"Internal server error"
// @Router			/conversations/{id}/messages [get]
func (h *handler) listConversationMessages(c echo.Context) error {
	userID, err := httpctx.GetUserID(c)
	if err != nil {
		return err
	}

	convID := c.Param(idParam)
	if err := uuid.Validate(convID); err != nil {
		return apperror.InvalidUUID("conversation id")
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
	ID             string `json:"id" example:"123e4567-e89b-12d3-a456-426614174000"`
	ConversationID string `json:"conversationId" example:"987fcdeb-51a2-43d7-9012-3456789abcde"`
	SenderID       string `json:"senderId" example:"123e4567-e89b-12d3-a456-426614174000"`
	Content        string `json:"content" example:"Привіт! Чи актуальне оголошення?"`
	IsRead         bool   `json:"isRead" example:"false"`

	CreatedAt time.Time `json:"createdAt" example:"2026-05-18T14:33:42Z"`
}

type listConversationMessagesRequest struct {
	PageSize  int    `query:"pageSize" validate:"omitempty,gte=1,lte=100"`
	PageToken string `query:"pageToken"`
}

type messagesHistoryResponse struct {
	Messages      []messageResponse `json:"messages"`
	NextPageToken string            `json:"nextPageToken,omitempty" example:"bGFzdF9pZA=="`
}
