package entity

import "time"

// UserRole визначає роль користувача у системі.
// Використання типу string замість int забезпечує читабельність у БД та логах.
type UserRole string

const (
	RoleUser      UserRole = "user"
	RoleVolunteer UserRole = "volunteer"
	RoleShelter   UserRole = "shelter"
	RoleAdmin     UserRole = "admin"
)

// User описує сутність користувача платформи.
// Поле AvatarKey зберігає ключ у S3 (nullable для користувачів без аватара).
// IsBanned використовується для м'якого блокування без видалення облікового запису.
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

// Tokens зберігає пару JWT-токенів для автентифікації.
type Tokens struct {
	AccessToken  string
	RefreshToken string
}

// CreateUserInput — DTO для створення користувача. Валідація виконується на рівні handler.
type CreateUserInput struct {
	FirstName string
	LastName  string

	Email       string
	PhoneNumber string

	Password string
}

// UpdateUserInput — DTO для оновлення профілю. Використання покажчиків дозволяє
// розрізняти "не передане поле" та "передане пусте значення".
type UpdateUserInput struct {
	ID string

	AvatarKey *string

	FirstName *string
	LastName  *string

	PhoneNumber *string
}

// UpdateUserPasswordInput — DTO для зміни пароля з перевіркою старого пароля.
type UpdateUserPasswordInput struct {
	ID string

	OldPassword string
	NewPassword string
}

// UpdateUserEmailInput — DTO для зміни email з підтвердженням паролем.
type UpdateUserEmailInput struct {
	ID string

	NewEmail string
	Password string
}

// ListUsersInput — параметри фільтрації та пагінації списку користувачів.
// Поле Search використовується для повнотекстового пошуку за іменем/емейлом.
type ListUsersInput struct {
	Limit  int
	Offset int
	Search *string

	ID       *string
	Role     *UserRole
	IsBanned *bool
}

// ListUsersOutput — результат зі списком користувачів та загальною кількістю для пагінації.
type ListUsersOutput struct {
	Users []User
	Total int
}
