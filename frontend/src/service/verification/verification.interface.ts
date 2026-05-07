import { UserRole } from "../user/user.interface"

export type VerificationStatus = "pending" | "approved" | "rejected"

export interface MyVerificationItem {
    id: string
    requestedRole: UserRole
    status: VerificationStatus
    createdAt: string
    adminNotes?: string
    documentUrls: string[]
}

export interface ListMyVerificationsParams {
    limit?: number
    offset?: number
    status?: VerificationStatus
}

export interface ListMyVerificationsResponse {
    requests: MyVerificationItem[]
    total: number
}

export interface CreateVerificationRequest {
    requestedRole: "volunteer" | "shelter"
    documentKeys: string[]
}

export interface GetVerificationUploadUrlsRequest {
    extensions: string[]
}

export interface VerificationUploadUrlTarget {
    uploadUrl: string
    documentKey: string
}

export interface GetVerificationUploadUrlsResponse {
    targets: VerificationUploadUrlTarget[]
}
