export interface Ad {
    id: string
    authorId: string
    title: string
    description: string
    imageUrls: string[]
    petType: number
    petGender: number
    petAgeMonth?: number
    petBreed?: string
    country: string
    city: string
    status: number
    isFavorite: boolean
    createdAt: string
    updatedAt: string
}

export interface EnrichedAd extends Ad {
    authorName: string
    authorAvatarUrl?: string
}

export interface GetUploadUrlsRequest {
    files: { ext: string }[]
}

export interface CreateAdRequest {
    title: string
    description: string
    imageKeys: string[]
    petType: number
    petGender: number
    petAgeMonth?: number | null
    petBreed?: string
    country: string
    city: string
}

export interface UpdateAdRequest extends Partial<CreateAdRequest> {
    status?: number
}

export interface ListAdsParams {
    limit?: number
    offset?: number
    sortBy?: "dateAsc" | "dateDesc"
    search?: string
    country?: string
    city?: string
    petType?: number
    petGender?: number
    status?: number
    minPetAgeMonth?: number
    maxPetAgeMonth?: number
}

export interface UploadUrlItem {
    uploadUrl: string
    imageKey: string
}

export interface GetUploadUrlsResponse {
    items: UploadUrlItem[]
}

export interface SingleAdResponse {
    advertisement: Ad
}

export interface SingleEnrichedAdResponse {
    advertisement: EnrichedAd
}

export interface ListAdsResponse {
    advertisements: Ad[]
    total: number
}
