import { UserRole } from "../user/user.interface"

export type VerificationStatus = "pending" | "approved" | "rejected"

export interface VerificationUserDTO {
    id: string
    firstName: string
    lastName: string
    email: string
    phoneNumber?: string
    avatarUrl?: string
}

export interface AdminVerificationItem {
    id: string
    requestedRole: UserRole
    status: VerificationStatus
    createdAt: string
    adminNotes?: string
    documentUrls: string[]
    user: VerificationUserDTO
}

export interface ListAdminVerificationsParams {
    limit?: number
    offset?: number
    status?: VerificationStatus
    query?: string
}

export interface ListAdminVerificationsResponse {
    requests: AdminVerificationItem[]
    total: number
}

export interface UpdateVerificationStatusRequest {
    status: "approved" | "rejected"
    adminNotes?: string
}
