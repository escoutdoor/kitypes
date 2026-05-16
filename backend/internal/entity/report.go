package entity

import "time"

type (
	ReportTargetType string
	ReportReason     string
	ReportStatus     string
)

const (
	TargetTypeAd      ReportTargetType = "ad"
	TargetTypeUser    ReportTargetType = "user"
	TargetTypeMessage ReportTargetType = "message"

	ReportReasonSpam          ReportReason = "spam"
	ReportReasonScam          ReportReason = "scam"
	ReportReasonInappropriate ReportReason = "inappropriate"
	ReportReasonAnimalCruelty ReportReason = "animal_cruelty"
	ReportReasonOther         ReportReason = "other"

	ReportStatusPending   ReportStatus = "pending"
	ReportStatusResolved  ReportStatus = "resolved"
	ReportStatusDismissed ReportStatus = "dismissed"
)

type Report struct {
	ID         string
	ReporterID *string // nullable — ON DELETE SET NULL

	TargetType ReportTargetType
	TargetID   string

	Reason  ReportReason
	Comment *string

	Status     ReportStatus
	AdminNotes *string

	CreatedAt time.Time
	UpdatedAt time.Time
}

type EnrichedReport struct {
	Report

	ReporterFirstName string
	ReporterLastName  string
	ReporterEmail     string
}

type CreateReportInput struct {
	ReporterID string
	TargetType ReportTargetType
	TargetID   string
	Reason     ReportReason
	Comment    *string
}

type UpdateReportStatusInput struct {
	ReportID   string
	Status     ReportStatus
	AdminNotes *string
}

type ListReportsInput struct {
	Limit  int
	Offset int

	Status     *ReportStatus
	TargetType *ReportTargetType
	TargetID   *string
	ReporterID *string
}

type ListReportsOutput struct {
	Reports []EnrichedReport
	Total   int
}
