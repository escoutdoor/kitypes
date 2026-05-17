package validator

import (
	"fmt"
	"net/http"
	"reflect"
	"regexp"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
)

var (
	uaPhoneNumberRegex = regexp.MustCompile(`^\+380\d{9}$`)
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

	v.RegisterValidation("uaphone", func(fl validator.FieldLevel) bool {
		return uaPhoneNumberRegex.MatchString(fl.Field().String())
	})

	return &CustomValidator{
		v: v,
	}
}

func (cv *CustomValidator) Validate(i any) error {
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
	case "required_if":
		parts := strings.SplitN(param, " ", 2)
		if len(parts) == 2 {
			return fmt.Sprintf("This field is required when %s is %s", parts[0], parts[1])
		}
		return fmt.Sprintf("This field is required based on condition: %s", param)
	case "required_without":
		return fmt.Sprintf("This field is required if %s is missing", param)
	case "required_with":
		return fmt.Sprintf("This field is required when %s is provided", param)
	case "oneof":
		formattedParam := strings.ReplaceAll(param, " ", ", ")
		return fmt.Sprintf("This field must be one of: %s", formattedParam)
	case "min":
		return fmt.Sprintf("This field must be at least %s characters/items long", param)
	case "max":
		return fmt.Sprintf("This field must be at most %s characters/items long", param)
	case "len":
		return fmt.Sprintf("This field must be exactly %s characters/items long", param)
	case "gte":
		return fmt.Sprintf("This field must be greater than or equal to %s", param)
	case "gt":
		return fmt.Sprintf("This field must be greater than %s", param)
	case "lte":
		return fmt.Sprintf("This field must be less than or equal to %s", param)
	case "eqfield":
		return fmt.Sprintf("This field must match the %s field", param)
	case "nefield":
		return fmt.Sprintf("This field cannot be the same as the %s field", param)
	case "email":
		return "This field must be a valid email address"
	case "url":
		return "This field must be a valid URL"
	case "uuid":
		return "This field must be a valid UUID"
	case "uaphone":
		return "This field must be a valid Ukrainian phone number (e.g. +380991234567)"
	case "alpha":
		return "This field can only contain letters"
	case "alphanum":
		return "This field can only contain letters and numbers"
	case "numeric":
		return "This field must be a valid numeric value"
	default:
		return "This field is invalid"
	}
}
