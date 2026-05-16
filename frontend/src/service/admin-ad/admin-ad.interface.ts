import { Ad } from "../ad/ad.interface"

export interface UpdateAdminAdStatusRequest {
    status: number
}

export interface ListAdminAdsParams {
    limit?: number
    offset?: number
    search?: string
    status?: number
    petType?: number
    authorId?: string
    sortBy?: "dateAsc" | "dateDesc"
}

export interface ListAdminAdsResponse {
    advertisements: Ad[]
    total: number
}
