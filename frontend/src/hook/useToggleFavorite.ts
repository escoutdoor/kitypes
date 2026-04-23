import { useMutation, useQueryClient } from "@tanstack/react-query"
import { FavoriteService } from "@/service/favorite/favorite.service"

interface ToggleFavoriteParams {
    adId: string
    isCurrentlyFavorite: boolean
}

export const useToggleFavorite = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ adId, isCurrentlyFavorite }: ToggleFavoriteParams) => {
            if (isCurrentlyFavorite) {
                await FavoriteService.remove(adId)
            } else {
                await FavoriteService.add(adId)
            }
            return { adId, isCurrentlyFavorite }
        },
        onMutate: async ({ adId, isCurrentlyFavorite }) => {
            await queryClient.cancelQueries({ queryKey: ["ad", adId] })
            await queryClient.cancelQueries({ queryKey: ["ads"] })

            const previousAd = queryClient.getQueryData(["ad", adId])

            queryClient.setQueryData(["ad", adId], (old: any) => {
                if (!old) return old
                return { ...old, isFavorite: !isCurrentlyFavorite }
            })

            queryClient.setQueriesData({ queryKey: ["ads"] }, (oldData: any) => {
                if (!oldData?.advertisements) return oldData
                return {
                    ...oldData,
                    advertisements: oldData.advertisements.map((ad: any) =>
                        ad.id === adId ? { ...ad, isFavorite: !isCurrentlyFavorite } : ad
                    ),
                }
            })

            return { previousAd }
        },
        onError: (_err, variables, context) => {
            if (context?.previousAd) {
                queryClient.setQueryData(["ad", variables.adId], context.previousAd)
            }
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: ["ad", variables.adId] })
            queryClient.invalidateQueries({ queryKey: ["ads"] })
            queryClient.invalidateQueries({ queryKey: ["favorites"] })
        },
    })
}
