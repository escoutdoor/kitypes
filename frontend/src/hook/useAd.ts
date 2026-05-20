import { useQuery } from "@tanstack/react-query"
import { AdService } from "@/service/ad/ad.service"
import { EnrichedAd } from "@/service/ad/ad.interface"

export const useAd = (id: string, initialData?: EnrichedAd) => {
    return useQuery({
        queryKey: ["ad", id],
        queryFn: () => AdService.get(id),
        enabled: !!id,
        initialData,
        staleTime: 60 * 1000,
    })
}
