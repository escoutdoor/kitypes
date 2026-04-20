import { api } from "@/lib/axios"
import {
    Ad,
    CreateAdRequest,
    UpdateAdRequest,
    ListAdsParams,
    ListAdsResponse,
    SingleAdResponse,
    GetUploadUrlsRequest,
    GetUploadUrlsResponse
} from "./ad.interface"

const ADS_PREFIX = "/v1/ads"

export class AdService {
    static async getUploadUrls(data: GetUploadUrlsRequest): Promise<GetUploadUrlsResponse> {
        const resp = await api.post<GetUploadUrlsResponse>(`${ADS_PREFIX}/upload-urls`, data)
        return resp.data
    }

    static async create(data: CreateAdRequest): Promise<Ad> {
        const resp = await api.post<SingleAdResponse>(`${ADS_PREFIX}/`, data)
        return resp.data.advertisement
    }

    static async get(adId: string): Promise<Ad> {
        const resp = await api.get<SingleAdResponse>(`${ADS_PREFIX}/${adId}`)
        return resp.data.advertisement
    }

    static async list(params?: ListAdsParams): Promise<ListAdsResponse> {
        const resp = await api.get<ListAdsResponse>(`${ADS_PREFIX}/`, { params })
        return {
            advertisements: resp.data.advertisements,
            total: resp.data.total,
        }
    }

    static async update(adId: string, data: UpdateAdRequest): Promise<Ad> {
        const resp = await api.patch<SingleAdResponse>(`${ADS_PREFIX}/${adId}`, data)
        return resp.data.advertisement
    }

    static async delete(adId: string): Promise<void> {
        await api.delete(`${ADS_PREFIX}/${adId}`)
    }
}
