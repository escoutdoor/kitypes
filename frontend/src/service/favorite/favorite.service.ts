import { api } from "@/lib/axios"
import { ListFavoritesParams, ListFavoritesResponse } from "./favorite.interface"

const FAVORITES_PREFIX = "/v1/favorites"

export class FavoriteService {
    static async add(adId: string): Promise<void> {
        await api.post(`${FAVORITES_PREFIX}/${adId}`)
    }

    static async remove(adId: string): Promise<void> {
        await api.delete(`${FAVORITES_PREFIX}/${adId}`)
    }

    static async list(params?: ListFavoritesParams): Promise<ListFavoritesResponse> {
        const resp = await api.get<ListFavoritesResponse>(`${FAVORITES_PREFIX}`, { params })
        return resp.data
    }
}
