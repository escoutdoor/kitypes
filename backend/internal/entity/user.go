package entity

import "time"

type UserRole string

const (
	RoleUser      UserRole = "user"
	RoleVolunteer UserRole = "volunteer"
	RoleShelter   UserRole = "shelter"
	RoleAdmin     UserRole = "admin"
)

type User struct {
	ID   string
	Role UserRole

	AvatarKey *string

	FirstName string
	LastName  string

	Email       string
	PhoneNumber string

	Password string

	IsBanned bool

	CreatedAt time.Time
	UpdatedAt time.Time
}

type Tokens struct {
	AccessToken  string
	RefreshToken string
}

type CreateUserInput struct {
	FirstName string
	LastName  string

	Email       string
	PhoneNumber string

	Password string
}

type UpdateUserInput struct {
	ID string

	AvatarKey *string

	FirstName *string
	LastName  *string

	PhoneNumber *string
}

type UpdateUserPasswordInput struct {
	ID string

	OldPassword string
	NewPassword string
}

type UpdateUserEmailInput struct {
	ID string

	NewEmail string
	Password string
}
