import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AdService } from "@/service/ad/ad.service"

export const useDeleteAd = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => AdService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-ads"] })
        }
    })
}
