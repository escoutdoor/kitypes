package v1

import (
	"net/http"
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	_ "github.com/escoutdoor/kitypes/backend/pkg/response"
	"github.com/labstack/echo/v4"
)

// @Summary		List conversations
// @Description	Retrieves a paginated list of conversations for the authenticated user.
// @Tags			Chat
// @Security		BearerAuth
// @Accept			json
// @Produce		json
// @Param			pageSize	query		int							false	"Items per page (1-100)"	default(20)
// @Param			pageToken	query		string						false	"Pagination token from previous response"
// @Success		200			{object}	conversationsListResponse	"List of conversations"
// @Failure		400			{object}	response.ErrorResponse		"Validation error or invalid page token"
// @Failure		401			{object}	response.ErrorResponse		"Unauthorized"
// @Failure		500			{object}	response.ErrorResponse		"Internal server error"
// @Router			/conversations [get]
func (h *handler) listConversations(c echo.Context) error {
	userID, err := httpctx.GetUserID(c)
	if err != nil {
		return err
	}

	req := new(listConversationsRequest)
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

	enrichedConvs, nextCursor, err := h.service.ListConversations(c.Request().Context(), userID, limit, cursor)
	if err != nil {
		return err
	}

	resp := conversationsListResponse{
		Conversations: h.enrichedConversationsToListItemResponse(enrichedConvs),
		NextPageToken: encodePageToken(nextCursor),
	}

	return c.JSON(http.StatusOK, resp)
}

type listConversationsRequest struct {
	PageSize  int    `query:"pageSize" validate:"omitempty,gte=1,lte=100"`
	PageToken string `query:"pageToken"`
}

type conversationsListResponse struct {
	Conversations []conversationListItemResponse `json:"conversations"`
	NextPageToken string                         `json:"nextPageToken,omitempty" example:"bGFzdF9pZA=="`
}

type conversationListItemResponse struct {
	ID string `json:"id" example:"123e4567-e89b-12d3-a456-426614174000"`

	Ad   adResponse   `json:"ad"`
	User userResponse `json:"user"`

	LastMessage *messageResponse `json:"lastMessage,omitempty"`
	CreatedAt   time.Time        `json:"createdAt" example:"2026-05-18T14:33:42Z"`
}

type adResponse struct {
	ID       string `json:"id" example:"987fcdeb-51a2-43d7-9012-3456789abcde"`
	Title    string `json:"title" example:"Рудий котик шукає дім"`
	ImageUrl string `json:"imageUrl" example:"https://s3.amazonaws.com/kitypes/ads/1.jpg"`
}

type userResponse struct {
	ID        string          `json:"id" example:"123e4567-e89b-12d3-a456-426614174000"`
	FirstName string          `json:"firstName" example:"Анатолій"`
	LastName  string          `json:"lastName" example:"Вовк"`
	AvatarUrl string          `json:"avatarUrl" example:"https://s3.amazonaws.com/kitypes/avatars/1.jpg"`
	Role      entity.UserRole `json:"role" example:"volunteer"`
}

func (h *handler) enrichedConversationsToListItemResponse(enrichedConvs []entity.EnrichedConversation) []conversationListItemResponse {
	items := make([]conversationListItemResponse, 0, len(enrichedConvs))

	for _, ec := range enrichedConvs {
		var lastMsg *messageResponse
		if ec.LastMessage != nil {
			msgResp := messageToResponse(*ec.LastMessage)
			lastMsg = &msgResp
		}

		var avatar string
		if ec.OtherUser.AvatarKey != nil && *ec.OtherUser.AvatarKey != "" {
			avatar = h.service.BuildPublicURL(*ec.OtherUser.AvatarKey)
		}

		var adImage string
		if len(ec.Ad.ImageKeys) > 0 && ec.Ad.ImageKeys[0] != "" {
			adImage = h.service.BuildPublicURL(ec.Ad.ImageKeys[0])
		}

		items = append(items, conversationListItemResponse{
			ID: ec.ID,
			Ad: adResponse{
				ID:       ec.Ad.ID,
				Title:    ec.Ad.Title,
				ImageUrl: adImage,
			},
			User: userResponse{
				ID:        ec.OtherUser.ID,
				FirstName: ec.OtherUser.FirstName,
				LastName:  ec.OtherUser.LastName,
				AvatarUrl: avatar,
				Role:      ec.OtherUser.Role,
			},
			LastMessage: lastMsg,

			CreatedAt: ec.CreatedAt,
		})
	}

	return items
}
