package apperror

import (
	"errors"
	"fmt"

	"github.com/escoutdoor/kitypes/backend/internal/apperror/code"
)

var (
	ErrJwtTokenExpired      = newError(code.JwtTokenExpired, "jwt token is already expired")
	ErrInvalidJwtToken      = newError(code.InvalidJwtToken, "invalid jwt token")
	ErrIncorrectCredentials = newError(code.IncorrectCreadentials, "incorrect credentials")

	AdAccessDenied = newError(code.PermissionDenied, "only author can manage this ad")

	ErrConversationNotFound  = newError(code.NotFound, "conversation not found")
	ConversationAccessDenied = newError(code.PermissionDenied, "you cannot manage this conversation")
	ErrCannotMessageYourself = newError(code.CannotMessageYourself, "you cannot message yourself")

	ErrEmptyUpdate = newError(code.EmptyUpdate, "nothing to update")

	ErrInvalidPetAgeMonthRange = newError(code.InvalidRequest, "invalid pet age month range")

	ErrInvalidUploadBatchSize = newError(code.InvalidRequest, "files count must be between 1 and 10")

	ErrAdAlreadyFavorited = newError(code.AlreadyExists, "advertisement is already in favorites")
	ErrFavoriteNotFound   = newError(code.NotFound, "advertisement is not in favorites")
)

type Error struct {
	Code code.Code
	Err  error
}

func (e *Error) Error() string {
	return e.Err.Error()
}

func (e *Error) Unwrap() error {
	return e.Err
}

func newError(code code.Code, err string) *Error {
	return &Error{
		Code: code,
		Err:  errors.New(err),
	}
}

func AdNotFoundID(adID string) *Error {
	msg := fmt.Sprintf("advertisement with id %q was not found", adID)
	return newError(code.NotFound, msg)
}

func UserNotFoundID(userID string) *Error {
	msg := fmt.Sprintf("user with id %q was not found", userID)
	return newError(code.NotFound, msg)
}

func ConversationNotFoundID(convID string) *Error {
	msg := fmt.Sprintf("conversation with id %q was not found", convID)
	return newError(code.NotFound, msg)
}

func UserNotFoundEmail(email string) *Error {
	msg := fmt.Sprintf("user with email %q was not found", email)
	return newError(code.NotFound, msg)
}

func EmailAlreadyExists(email string) *Error {
	msg := fmt.Sprintf("user with email %q is already exists", email)

	return newError(code.AlreadyExists, msg)
}

func UnsupportedImageExtension(ext string) *Error {
	return newError(code.InvalidRequest, fmt.Sprintf("unsupported image extension %q, allowed: .jpg, .jpeg, .png, .webp", ext))
}
