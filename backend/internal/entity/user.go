package entity

import "time"

type User struct {
	ID string

	AvatarUrl *string

	FirstName string
	LastName  string

	Email       string
	PhoneNumber string

	Password string

	CreatedAt time.Time
	UpdatedAt time.Time
}

type Tokens struct {
	AccessToken  string
	RefreshToken string
}

type UpdateUser struct {
	ID string

	AvatarUrl *string

	FirstName *string
	LastName  *string

	Email       *string
	PhoneNumber *string

	Password *string
}
