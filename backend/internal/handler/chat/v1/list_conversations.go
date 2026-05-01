package v1

import (
	"net/http"
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/util/httpctx"
	"github.com/labstack/echo/v4"
)

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
	NextPageToken string                         `json:"nextPageToken,omitempty"`
}

type conversationListItemResponse struct {
	ID string `json:"id"`

	Ad   adResponse   `json:"ad"`
	User userResponse `json:"user"`

	LastMessage *messageResponse `json:"lastMessage,omitempty"`
	CreatedAt   time.Time        `json:"createdAt"`
}

type adResponse struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	ImageUrl string `json:"imageUrl"`
}

type userResponse struct {
	ID        string `json:"id"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	AvatarUrl string `json:"avatarUrl"`
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
			},
			LastMessage: lastMsg,

			CreatedAt: ec.CreatedAt,
		})
	}

	return items
}
