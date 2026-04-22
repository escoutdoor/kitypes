import { useQuery } from "@tanstack/react-query"
import { AdService } from "@/service/ad/ad.service"

export const useAd = (id: string) => {
    return useQuery({
        queryKey: ["ad", id],
        queryFn: () => AdService.get(id),
        enabled: !!id,
    })
}
