package entity

import "time"

// ReportTargetType визначає тип об'єкта скарги (оголошення, користувач, повідомлення).
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

// Report описує скаргу від користувача. Поле ReporterID nullable для збереження
// скарг при видаленні облікового запису репортера
type Report struct {
	ID         string
	ReporterID *string

	TargetType ReportTargetType
	TargetID   string

	Reason  ReportReason
	Comment *string

	Status     ReportStatus
	AdminNotes *string

	CreatedAt time.Time
	UpdatedAt time.Time
}

// EnrichedReport розширює Report даними репортера для адміністративної панелі.
type EnrichedReport struct {
	Report

	ReporterFirstName string
	ReporterLastName  string
	ReporterEmail     string
}

// CreateReportInput — DTO для створення скарги. TargetType/TargetID реалізують
// поліморфну зв'язок з різними сутностями без денормалізації БД.
type CreateReportInput struct {
	ReporterID string
	TargetType ReportTargetType
	TargetID   string
	Reason     ReportReason
	Comment    *string
}

// UpdateReportStatusInput — DTO для модерації скарги. SendWarningEmail дозволяє
// автоматично надіслати попередження порушнику при вирішенні скарги.
type UpdateReportStatusInput struct {
	ReportID         string
	Status           ReportStatus
	AdminNotes       *string
	SendWarningEmail bool
}

// ListReportsInput — параметри фільтрації скарг для адміністративного інтерфейсу.
type ListReportsInput struct {
	Limit  int
	Offset int

	Status     *ReportStatus
	TargetType *ReportTargetType
	TargetID   *string
	ReporterID *string
}

// ListReportsOutput — результат зі скаргами та загальною кількістю.
type ListReportsOutput struct {
	Reports []EnrichedReport
	Total   int
}
