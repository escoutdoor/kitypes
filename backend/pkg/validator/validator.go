package validator

import (
	"fmt"
	"net/http"
	"reflect"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
)

type validationErr struct {
	Field string `json:"field"`
	Msg   string `json:"message"`
}

type CustomValidator struct {
	v *validator.Validate
}

func New() *CustomValidator {
	v := validator.New()
	v.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
		if name == "-" {
			return ""
		}
		return name
	})

	return &CustomValidator{
		v: v,
	}
}

func (cv *CustomValidator) Validate(i interface{}) error {
	return cv.v.Struct(i)
}

func (cv *CustomValidator) BindValidate(c echo.Context, i any) error {
	if err := c.Bind(i); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	if err := cv.v.Struct(i); err != nil {
		var validationErrors []validationErr

		if errs, ok := err.(validator.ValidationErrors); ok {
			for _, e := range errs {
				validationErrors = append(validationErrors, validationErr{
					Field: e.Field(),
					Msg:   msgForTag(e),
				})
			}
		}
		return echo.NewHTTPError(http.StatusBadRequest, map[string]any{
			"errors": validationErrors,
		})
	}

	return nil
}

func msgForTag(err validator.FieldError) string {
	param := err.Param()

	switch err.Tag() {
	case "required":
		return "This field is required"
	case "min":
		return fmt.Sprintf("This field must be at least %s characters long", param)
	case "max":
		return fmt.Sprintf("This field must be at most %s characters long", param)
	case "email":
		return "This field must be a valid email address"
	case "url":
		return "This field must be a valid URL"
	case "uuid":
		return "This field must be a valid UUID"
	case "gte":
		return fmt.Sprintf("This field must be greater than or equal to %s", param)
	case "gt":
		return fmt.Sprintf("This field must be greater than %s", param)
	case "lte":
		return fmt.Sprintf("This field must be less than or equal to %s", param)
	case "e164":
		return "This field must be a valid phone number"
	default:
		return "This field is invalid"
	}
}
