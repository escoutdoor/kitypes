package entity

import "time"

type VerificationStatus string

const (
	VerificationStatusPending  VerificationStatus = "pending"
	VerificationStatusApproved VerificationStatus = "approved"
	VerificationStatusRejected VerificationStatus = "rejected"
)

type VerificationRequest struct {
	ID     string
	UserID string

	RequestedRole UserRole

	Status     VerificationStatus
	AdminNotes *string

	DocumentKeys []string

	CreatedAt time.Time
	UpdatedAt time.Time
}

type EnrichedVerificationRequest struct {
	VerificationRequest

	UserFirstName   string
	UserLastName    string
	UserEmail       string
	UserPhoneNumber *string
	UserAvatarKey   *string
}

type CreateVerificationRequestInput struct {
	UserID      string
	CurrentRole UserRole

	RequestedRole UserRole
	DocumentKeys  []string
}

type UpdateVerificationStatusInput struct {
	RequestID  string
	Status     VerificationStatus
	AdminNotes *string
}

type ListVerificationsInput struct {
	Limit  int
	Offset int

	Status *VerificationStatus
	UserID *string
	Query  *string
}

type ListVerificationsOutput struct {
	Requests []EnrichedVerificationRequest
	Total    int
}

type VerificationDocumentUploadTarget struct {
	UploadURL   string
	DocumentKey string
}
