import { useQuery, } from "@tanstack/react-query"
import { AdService } from "@/service/ad/ad.service"
import { ListAdsParams } from "@/service/ad/ad.interface"

export const useMyAds = (params: ListAdsParams) => {
    return useQuery({
        queryKey: ["my-ads", params],
        queryFn: () => AdService.listMyAds(params),
        placeholderData: (prev) => prev,
        staleTime: 60_000,
    })
}
