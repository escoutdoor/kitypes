import { api } from "@/lib/axios"
import {
    Ad,
    CreateAdRequest,
    UpdateAdRequest,
    ListAdsParams,
    ListAdsResponse,
    SingleAdResponse,
    GetUploadUrlsRequest,
    GetUploadUrlsResponse,
    SingleEnrichedAdResponse,
    EnrichedAd
} from "./ad.interface"

const ADS_PREFIX = "/v1/ads"

export class AdService {
    static async getUploadUrls(data: GetUploadUrlsRequest): Promise<GetUploadUrlsResponse> {
        const resp = await api.post<GetUploadUrlsResponse>(`${ADS_PREFIX}/upload-urls`, data)
        return resp.data
    }

    static async create(data: CreateAdRequest): Promise<Ad> {
        const resp = await api.post<SingleAdResponse>(`${ADS_PREFIX}`, data)
        return resp.data.advertisement
    }

    static async get(adId: string): Promise<EnrichedAd> {
        const resp = await api.get<SingleEnrichedAdResponse>(`${ADS_PREFIX}/${adId}`)
        return resp.data.advertisement
    }

    static async getPhone(adId: string): Promise<{ phone: string }> {
        const resp = await api.get<{ phone: string }>(`${ADS_PREFIX}/${adId}/phone`)
        return resp.data
    }

    static async list(params?: ListAdsParams): Promise<ListAdsResponse> {
        const resp = await api.get<ListAdsResponse>(`${ADS_PREFIX}`, { params })
        return {
            advertisements: resp.data.advertisements,
            total: resp.data.total,
        }
    }

    static async listMyAds(params?: ListAdsParams): Promise<ListAdsResponse> {
        const resp = await api.get<ListAdsResponse>(`${ADS_PREFIX}/me`, { params })
        return {
            advertisements: resp.data.advertisements,
            total: resp.data.total,
        }
    }

    static async changeStatus(adId: string, status: number): Promise<Ad> {
        const resp = await api.patch<SingleAdResponse>(`${ADS_PREFIX}/${adId}`, { status })
        return resp.data.advertisement
    }

    static async update(adId: string, data: UpdateAdRequest): Promise<Ad> {
        const resp = await api.patch<SingleAdResponse>(`${ADS_PREFIX}/${adId}`, data)
        return resp.data.advertisement
    }

    static async delete(adId: string): Promise<void> {
        await api.delete(`${ADS_PREFIX}/${adId}`)
    }
}
