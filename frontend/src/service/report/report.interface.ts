export const REPORT_TARGET_TYPE = {
    AD: "ad",
    USER: "user",
    MESSAGE: "message",
} as const

export const REPORT_REASON = {
    SPAM: "spam",
    SCAM: "scam",
    INAPPROPRIATE: "inappropriate",
    ANIMAL_CRUELTY: "animal_cruelty",
    OTHER: "other",
} as const

export const REPORT_STATUS = {
    PENDING: "pending",
    RESOLVED: "resolved",
    DISMISSED: "dismissed",
} as const

export type ReportTargetType = typeof REPORT_TARGET_TYPE[keyof typeof REPORT_TARGET_TYPE]
export type ReportReason = typeof REPORT_REASON[keyof typeof REPORT_REASON]
export type ReportStatus = typeof REPORT_STATUS[keyof typeof REPORT_STATUS]

export interface Report {
    id: string
    reporterId: string | null
    targetType: ReportTargetType
    targetId: string
    reason: ReportReason
    comment?: string
    status: ReportStatus
    adminNotes?: string
    createdAt: string
    updatedAt: string
}

export interface Reporter {
    firstName: string
    lastName: string
    email: string
}

export interface EnrichedReport extends Report {
    reporter: Reporter
}

export interface CreateReportRequest {
    targetType: ReportTargetType
    targetId: string
    reason: ReportReason
    comment?: string
}

export interface UpdateReportStatusRequest {
    status: Extract<ReportStatus, "resolved" | "dismissed">
    adminNotes?: string
}

export interface ListReportsParams {
    limit?: number
    offset?: number
    status?: ReportStatus
    targetType?: ReportTargetType
    targetId?: string
    reporterId?: string
}

export interface ListReportsResponse {
    reports: EnrichedReport[]
    total: number
}

export interface SingleReportResponse {
    report: EnrichedReport
}

export interface BlockAdAndResolveRequest {
    adId: string
    adminNotes?: string
}

export interface BanUserAndResolveRequest {
    targetUserId: string
    adminNotes?: string
}
