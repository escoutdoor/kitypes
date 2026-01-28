package entity

import "time"

type User struct {
	ID string

	FirstName string
	LastName  string

	Email       string
	PhoneNumber string

	Password string

	CreatedAt time.Time
	UpdatedAt time.Time
}
