package report

import (
	"context"
	"time"

	"github.com/escoutdoor/kitypes/backend/internal/entity"
	"github.com/escoutdoor/kitypes/backend/internal/middleware"
	"github.com/escoutdoor/kitypes/backend/pkg/validator"
	"github.com/labstack/echo/v4"
)

const (
	idParam = "id"
)

type reportService interface {
	Create(ctx context.Context, in entity.CreateReportInput) error
	List(ctx context.Context, in entity.ListReportsInput) (entity.ListReportsOutput, error)
	GetByID(ctx context.Context, reportID string) (entity.EnrichedReport, error)

	UpdateStatus(ctx context.Context, in entity.UpdateReportStatusInput) error
	BlockAdAndResolveReport(ctx context.Context, reportID string, adID string, adminNotes *string) error
	BanUserAndResolveReport(ctx context.Context, reportID string, targetUserID string, adminNotes *string) error
}

type handler struct {
	service reportService
	cv      *validator.CustomValidator
}

func RegisterHandlers(
	e *echo.Group,
	authMw echo.MiddlewareFunc,
	service reportService,
	cv *validator.CustomValidator,
) {
	h := &handler{service: service, cv: cv}

	userGroup := e.Group("/reports")
	userGroup.Use(authMw)
	userGroup.POST("", h.create)

	adminGroup := e.Group("/admin/reports")
	adminGroup.Use(authMw, middleware.RequireRoles(entity.RoleAdmin))
	adminGroup.GET("", h.list)
	adminGroup.GET("/:id", h.get)
	adminGroup.PATCH("/:id/status", h.updateStatus)
	adminGroup.POST("/:id/block-ad", h.blockAdAndResolve)
	adminGroup.POST("/:id/ban-user", h.banUserAndResolve)
}

type enrichedReportResponse struct {
	reportResponse
	Reporter reporterResponse `json:"reporter"`
}

type reportResponse struct {
	ID         string                  `json:"id" example:"123e4567-e89b-12d3-a456-426614174000"`
	ReporterID *string                 `json:"reporterId,omitempty" example:"987fcdeb-51a2-43d7-9012-3456789abcde"`
	TargetType entity.ReportTargetType `json:"targetType" example:"ad"`
	TargetID   string                  `json:"targetId" example:"111e2222-e33b-44d3-a456-426614174000"`
	Reason     entity.ReportReason     `json:"reason" example:"spam"`
	Comment    *string                 `json:"comment,omitempty" example:"Підозрілий контент"`
	Status     entity.ReportStatus     `json:"status" example:"pending"`
	AdminNotes *string                 `json:"adminNotes,omitempty" example:"Порушення правил"`
	CreatedAt  time.Time               `json:"createdAt" example:"2026-05-18T14:33:42Z"`
	UpdatedAt  time.Time               `json:"updatedAt" example:"2026-05-18T14:33:42Z"`
}

type reporterResponse struct {
	FirstName string `json:"firstName" example:"Анатолій"`
	LastName  string `json:"lastName" example:"Вовк"`
	Email     string `json:"email" example:"user@example.com"`
}

func reportToResponse(r entity.Report) reportResponse {
	return reportResponse{
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

func enrichedReportToResponse(r entity.EnrichedReport) enrichedReportResponse {
	return enrichedReportResponse{
		reportResponse: reportToResponse(r.Report),
		Reporter: reporterResponse{
			FirstName: r.ReporterFirstName,
			LastName:  r.ReporterLastName,
			Email:     r.ReporterEmail,
		},
	}
}
