package apperror

import (
	"errors"
	"fmt"

	"github.com/escoutdoor/kitypes/backend/internal/apperror/code"
)

var (
	ErrJwtTokenExpired       = newError(code.JwtTokenExpired, "jwt token is already expired")
	ErrInvalidJwtToken       = newError(code.InvalidJwtToken, "invalid jwt token")
	ErrIncorrectCreadentials = newError(code.IncorrectCreadentials, "incorrect creadentials")
)

type Error struct {
	Code code.Code
	Err  error
}

func (e *Error) Error() string {
	return e.Err.Error()
}

func newError(code code.Code, err string) *Error {
	return &Error{
		Code: code,
		Err:  errors.New(err),
	}
}

func AdNotFoundID(adID string) *Error {
	msg := fmt.Sprintf("advertisement with id %q was not found", adID)
	return newError(code.AdNotFound, msg)
}

func UserNotFoundID(userID string) *Error {
	msg := fmt.Sprintf("user with id %q was not found", userID)
	return newError(code.UserNotFound, msg)
}

func UserNotFoundEmail(email string) *Error {
	msg := fmt.Sprintf("user with email %q was not found", email)
	return newError(code.UserNotFound, msg)
}

func EmailAlreadyExists(email string) *Error {
	msg := fmt.Sprintf("user with email '%s is already exists", email)
	return newError(code.EmailAlreadyExists, msg)
}
