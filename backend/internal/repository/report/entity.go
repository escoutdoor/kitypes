package report

import (
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/pkg/errwrap"
)

type Report struct {
	ID         string  `db:"id"`
	ReporterID *string `db:"reporter_id"`

	TargetType entity.ReportTargetType `db:"target_type"`
	TargetID   string                  `db:"target_id"`

	Reason  entity.ReportReason `db:"reason"`
	Comment *string             `db:"comment"`

	Status     entity.ReportStatus `db:"status"`
	AdminNotes *string             `db:"admin_notes"`

	CreatedAt time.Time `db:"created_at"`
	UpdatedAt time.Time `db:"updated_at"`
}

func (r Report) ToEntity() entity.Report {
	return entity.Report{
		ID:         r.ID,
		ReporterID: r.ReporterID,
		TargetType: r.TargetType,
		TargetID:   r.TargetID,
		Reason:     r.Reason,
		Comment:    r.Comment,
		Status:     r.Status,
		AdminNotes: r.AdminNotes,
		CreatedAt:  r.CreatedAt,
		UpdatedAt:  r.UpdatedAt,
	}
}

type EnrichedReport struct {
	Report

	ReporterFirstName string `db:"reporter_first_name"`
	ReporterLastName  string `db:"reporter_last_name"`
	ReporterEmail     string `db:"reporter_email"`
}

func (e EnrichedReport) ToEntity() entity.EnrichedReport {
	return entity.EnrichedReport{
		Report:            e.Report.ToEntity(),
		ReporterFirstName: e.ReporterFirstName,
		ReporterLastName:  e.ReporterLastName,
		ReporterEmail:     e.ReporterEmail,
	}
}

type EnrichedReports []EnrichedReport

func (e EnrichedReports) ToEntityList() []entity.EnrichedReport {
	list := make([]entity.EnrichedReport, 0, len(e))
	for _, i := range e {
		list = append(list, i.ToEntity())
	}
	return list
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
