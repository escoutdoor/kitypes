import { useMutation } from "@tanstack/react-query"
import { AdService } from "@/service/ad/ad.service"

export const usePhone = () => {
    return useMutation({
        mutationFn: (adId: string) => AdService.getPhone(adId),
    })
}
