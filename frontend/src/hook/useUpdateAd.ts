import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AdService } from "@/service/ad/ad.service"
import { UpdateAdRequest } from "@/service/ad/ad.interface"

export const useUpdateAd = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateAdRequest }) => AdService.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["ad", variables.id] })
            queryClient.invalidateQueries({ queryKey: ["my-ads"] })
            queryClient.invalidateQueries({ queryKey: ["ads"] })
        },
    })
}
