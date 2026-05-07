package verification

import (
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

type VerificationRequest struct {
	ID     string `db:"id"`
	UserID string `db:"user_id"`

	RequestedRole entity.UserRole `db:"requested_role"`

	Status     entity.VerificationStatus `db:"status"`
	AdminNotes *string                   `db:"admin_notes"`

	DocumentKeys []string `db:"-"`

	CreatedAt time.Time `db:"created_at"`
	UpdatedAt time.Time `db:"updated_at"`
}

func (v VerificationRequest) ToEntity() entity.VerificationRequest {
	return entity.VerificationRequest{
		ID:            v.ID,
		UserID:        v.UserID,
		RequestedRole: v.RequestedRole,
		Status:        v.Status,
		AdminNotes:    v.AdminNotes,
		DocumentKeys:  v.DocumentKeys,
		CreatedAt:     v.CreatedAt,
		UpdatedAt:     v.UpdatedAt,
	}
}

type EnrichedVerificationRequest struct {
	VerificationRequest

	UserFirstName   string  `db:"user_first_name"`
	UserLastName    string  `db:"user_last_name"`
	UserEmail       string  `db:"user_email"`
	UserPhoneNumber *string `db:"user_phone_number"`
	UserAvatarKey   *string `db:"user_avatar_key"`
}

func (v EnrichedVerificationRequest) ToEntity() entity.EnrichedVerificationRequest {
	return entity.EnrichedVerificationRequest{
		VerificationRequest: v.VerificationRequest.ToEntity(),
		UserFirstName:       v.UserFirstName,
		UserLastName:        v.UserLastName,
		UserEmail:           v.UserEmail,
		UserPhoneNumber:     v.UserPhoneNumber,
		UserAvatarKey:       v.UserAvatarKey,
	}
}

type EnrichedVerificationRequests []EnrichedVerificationRequest

func (v EnrichedVerificationRequests) ToEntityList() []entity.EnrichedVerificationRequest {
	list := make([]entity.EnrichedVerificationRequest, 0, len(v))
	for _, i := range v {
		list = append(list, i.ToEntity())
	}
	return list
}

type documentMapping struct {
	RequestID string `db:"request_id"`
	Key       string `db:"document_key"`
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
