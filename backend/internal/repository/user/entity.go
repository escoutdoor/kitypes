package user

import (
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

type User struct {
	ID string `db:"id"`

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
		ID: u.ID,

		FirstName: u.FirstName,
		LastName:  u.LastName,

		Email:       u.Email,
		PhoneNumber: u.PhoneNumber,

		Password: u.Password,

		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}
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
