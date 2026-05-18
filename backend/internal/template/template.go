package template

import (
	"bytes"
	"embed"
	"html/template"

	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

const (
	resetPasswordHTML  = "reset_password.html"
	warningWarningHTML = "warning.html"
)

//go:embed email/*.html
var emailFS embed.FS

var (
	emailTemplates = template.Must(template.ParseFS(emailFS, "email/*.html"))
)

type ResetPasswordData struct {
	ResetLink string
}

func RenderResetPassword(data ResetPasswordData) (string, error) {
	var buf bytes.Buffer
	if err := emailTemplates.ExecuteTemplate(&buf, resetPasswordHTML, data); err != nil {
		return "", errwrap.Wrap("execute reset_password template", err)
	}

	return buf.String(), nil
}

type WarningData struct {
	AdminNotes    string
	TargetContext string
}

func RenderWarning(data WarningData) (string, error) {
	var buf bytes.Buffer
	if err := emailTemplates.ExecuteTemplate(&buf, warningWarningHTML, data); err != nil {
		return "", errwrap.Wrap("execute warning template", err)
	}

	return buf.String(), nil
}
