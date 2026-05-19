import { api } from "@/lib/axios"
import {
    CreateVerificationRequest,
    GetVerificationUploadUrlsRequest,
    GetVerificationUploadUrlsResponse,
    ListMyVerificationsParams,
    ListMyVerificationsResponse,
    MyVerificationItem
} from "./verification.interface"

const VERIFICATION_PREFIX = "/v1/verifications"

export class VerificationService {
    static async listMy(params?: ListMyVerificationsParams): Promise<ListMyVerificationsResponse> {
        const resp = await api.get<ListMyVerificationsResponse>(`${VERIFICATION_PREFIX}`, { params })
        return resp.data
    }

    static async getUploadUrls(data: GetVerificationUploadUrlsRequest): Promise<GetVerificationUploadUrlsResponse> {
        const resp = await api.post<GetVerificationUploadUrlsResponse>(`${VERIFICATION_PREFIX}/upload-urls`, data)
        return resp.data
    }

    static async create(data: CreateVerificationRequest): Promise<MyVerificationItem> {
        const resp = await api.post<MyVerificationItem>(`${VERIFICATION_PREFIX}`, data)
        return resp.data
    }
}
