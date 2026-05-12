import { api } from "@/lib/axios"
import { UpdateAdminAdStatusRequest } from "./admin-ad.interface"

const ADMIN_ADS_PREFIX = "/v1/admin/ads"

export class AdminAdService {
    static async updateStatus(adId: string, data: UpdateAdminAdStatusRequest): Promise<void> {
        await api.patch(`${ADMIN_ADS_PREFIX}/${adId}/status`, data)
    }
}
