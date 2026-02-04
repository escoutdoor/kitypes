package entity

import "time"

type FavoriteAd struct {
	ID string
	Ad Ad

	CreatedAt time.Time
}
