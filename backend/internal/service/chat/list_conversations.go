package chat

import (
	"context"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

func (s *Service) ListConversations(ctx context.Context, userID string, limit int, cursor string) ([]entity.EnrichedConversation, string, error) {
	convs, msgs, err := s.conversationRepo.ListByUserID(ctx, userID, limit, cursor)
	if err != nil {
		return nil, "", errwrap.Wrap("list conversations from repo", err)
	}

	if len(convs) == 0 {
		return []entity.EnrichedConversation{}, "", nil
	}

	adIDs := make([]string, 0, len(convs))
	userIDs := make([]string, 0, len(convs))

	for _, c := range convs {
		adIDs = append(adIDs, c.AdID)
		userIDs = append(userIDs, s.getReceiver(c, userID))
	}

	out, err := s.adRepo.List(ctx, entity.ListAdsInput{AdIDs: adIDs})
	if err != nil {
		return nil, "", errwrap.Wrap("list ads by ids", err)
	}
	adsMap := make(map[string]entity.Ad, len(out.Ads))
	for _, a := range out.Ads {
		adsMap[a.ID] = a
	}

	users, err := s.userRepo.ListByIDs(ctx, userIDs)
	if err != nil {
		return nil, "", errwrap.Wrap("list users by ids", err)
	}
	usersMap := make(map[string]entity.User, len(users))
	for _, u := range users {
		usersMap[u.ID] = u
	}

	enriched := make([]entity.EnrichedConversation, 0, len(convs))
	for _, c := range convs {
		ad, okAd := adsMap[c.AdID]
		otherUser, okUser := usersMap[s.getReceiver(c, userID)]

		if !okAd || !okUser {
			continue
		}

		enriched = append(enriched, entity.EnrichedConversation{
			ID:          c.ID,
			Ad:          ad,
			OtherUser:   otherUser,
			LastMessage: msgs[c.ID],
			CreatedAt:   c.CreatedAt,
		})
	}

	var nextCursor string
	if len(convs) == limit {
		lastConv := convs[len(convs)-1]
		lastMsg := msgs[lastConv.ID]

		if lastMsg != nil {
			nextCursor = lastMsg.ID
		} else {
			nextCursor = lastConv.ID
		}
	}

	return enriched, nextCursor, nil
}
