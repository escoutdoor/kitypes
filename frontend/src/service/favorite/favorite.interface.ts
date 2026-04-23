import { Ad } from "../ad/ad.interface"

export interface FavoriteItem {
    id: string
    advertisement: Ad
    createdAt: string
}

export interface ListFavoritesResponse {
    favorites: FavoriteItem[]
    total: number
}

export interface ListFavoritesParams {
    limit?: number
    offset?: number
    sortBy?: "dateAsc" | "dateDesc"
}
