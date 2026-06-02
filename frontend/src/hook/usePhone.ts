import { useMutation } from "@tanstack/react-query"
import { AdService } from "@/service/ad/ad.service"

// usePhone реалізує отримання номера телефону автора оголошення.
export const usePhone = () => {
    return useMutation({
        mutationFn: (adId: string) => AdService.getPhone(adId),
    })
}
