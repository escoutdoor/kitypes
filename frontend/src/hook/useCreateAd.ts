import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AdService } from "@/service/ad/ad.service"
import { CreateAdRequest } from "@/service/ad/ad.interface"

// useCreateAd реалізує створення оголошення з інвалідацією кешу.
// Після успішного створення скидаються кеші списків оголошень та "мої оголошення"
// для синхронізації UI з серверним станом.
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
