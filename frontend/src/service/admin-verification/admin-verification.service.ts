import { api } from "@/lib/axios"
import {
    ListAdminVerificationsParams,
    ListAdminVerificationsResponse,
    UpdateVerificationStatusRequest
} from "./admin-verification.interface"

const ADMIN_VERIFICATION_PREFIX = "/v1/admin/verifications"

export class AdminVerificationService {
    static async list(params?: ListAdminVerificationsParams): Promise<ListAdminVerificationsResponse> {
        const resp = await api.get<ListAdminVerificationsResponse>(`${ADMIN_VERIFICATION_PREFIX}`, { params })
        return resp.data
    }

    static async updateStatus(id: string, data: UpdateVerificationStatusRequest): Promise<void> {
        await api.patch(`${ADMIN_VERIFICATION_PREFIX}/${id}/status`, data)
    }
}
