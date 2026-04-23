import { useQuery } from "@tanstack/react-query"
import { FavoriteService } from "@/service/favorite/favorite.service"
import { ListFavoritesParams } from "@/service/favorite/favorite.interface"

export const useFavorites = (params: ListFavoritesParams) => {
    return useQuery({
        queryKey: [
            "favorites",
            params.limit ?? null,
            params.offset ?? null,
            params.sortBy ?? "dateDesc",
        ],
        queryFn: () => FavoriteService.list(params),
        placeholderData: (prev) => prev,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    })
}
