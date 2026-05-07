package user

import (
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

type User struct {
	ID   string          `db:"id"`
	Role entity.UserRole `db:"role"`

	AvatarKey *string `db:"avatar_key"`

	FirstName string `db:"first_name"`
	LastName  string `db:"last_name"`

	Email       string `db:"email"`
	PhoneNumber string `db:"phone_number"`

	Password string `db:"password"`

	CreatedAt time.Time `db:"created_at"`
	UpdatedAt time.Time `db:"updated_at"`
}

func (u User) ToEntity() entity.User {
	return entity.User{
		ID:   u.ID,
		Role: u.Role,

		AvatarKey: u.AvatarKey,

		FirstName: u.FirstName,
		LastName:  u.LastName,

		Email:       u.Email,
		PhoneNumber: u.PhoneNumber,

		Password: u.Password,

		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}
}

type Users []User

func (e Users) ToEntities() []entity.User {
	list := make([]entity.User, 0, len(e))
	for _, u := range e {
		list = append(list, u.ToEntity())
	}

	return list
}

func buildSQLError(err error) error {
	return errwrap.Wrap("build sql", err)
}

func executeSQLError(err error) error {
	return errwrap.Wrap("execute sql", err)
}

func scanRowError(err error) error {
	return errwrap.Wrap("scan row", err)
}

func scanRowsError(err error) error {
	return errwrap.Wrap("scan rows", err)
}
