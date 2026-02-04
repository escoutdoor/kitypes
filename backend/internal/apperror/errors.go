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

	AdAccessDenied = newError(code.PermissionDenied, "only author can manage this ad")

	ErrConversationNotFound  = newError(code.ConversationNotFound, "conversation not found")
	ConversationAccessDenied = newError(code.PermissionDenied, "you cannot manage this conversation")
	ErrCannotMessageYourself = newError(code.CannotMessageYourself, "you cannot message yourself")
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

func ConversationNotFoundID(convID string) *Error {
	msg := fmt.Sprintf("conversation with id %q was not found", convID)
	return newError(code.ConversationNotFound, msg)
}

func UserNotFoundEmail(email string) *Error {
	msg := fmt.Sprintf("user with email %q was not found", email)
	return newError(code.UserNotFound, msg)
}

func EmailAlreadyExists(email string) *Error {
	msg := fmt.Sprintf("user with email '%q is already exists", email)
	return newError(code.EmailAlreadyExists, msg)
}
