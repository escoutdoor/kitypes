package apperror

import (
	"errors"
	"fmt"

	"github.com/escoutdoor/kitypes/backend/internal/apperror/code"
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
	msg := fmt.Sprintf("advertisement with id %q was not foun", adID)
	return newError(code.AdNotFound, msg)
}
