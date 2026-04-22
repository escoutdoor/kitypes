package entity

import "time"

type Favorite struct {
	ID string
	Ad Ad

	CreatedAt time.Time
}

type ListFavoritesInput struct {
	Limit  int
	Offset int
	SortBy string

	UserID string
}

type ListFavoritesOutput struct {
	Favorites []Favorite
	Total     int
}
