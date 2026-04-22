import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AdService } from "@/service/ad/ad.service"
import { CreateAdRequest } from "@/service/ad/ad.interface"

export const useCreateAd = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateAdRequest) => AdService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ads"] })
            queryClient.invalidateQueries({ queryKey: ["my-ads"] })
        },
    })
}
