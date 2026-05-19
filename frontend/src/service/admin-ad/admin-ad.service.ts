import { api } from "@/lib/axios"
import { ListAdminAdsParams, ListAdminAdsResponse, UpdateAdminAdStatusRequest } from "./admin-ad.interface"

const ADMIN_ADS_PREFIX = "/v1/admin/ads"

export class AdminAdService {
    static async list(params?: ListAdminAdsParams): Promise<ListAdminAdsResponse> {
        const resp = await api.get<ListAdminAdsResponse>(`${ADMIN_ADS_PREFIX}`, { params })
        return resp.data
    }

    static async updateStatus(adId: string, data: UpdateAdminAdStatusRequest): Promise<void> {
        await api.patch(`${ADMIN_ADS_PREFIX}/${adId}/status`, data)
    }
}
