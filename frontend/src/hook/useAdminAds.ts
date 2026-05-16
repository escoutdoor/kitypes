import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { AdminAdService } from "@/service/admin-ad/admin-ad.service"
import { ListAdminAdsParams } from "@/service/admin-ad/admin-ad.interface"

export const useAdminAds = (params: ListAdminAdsParams) => {
    return useQuery({
        queryKey: ["admin-ads", params.limit, params.offset, params.status, params.petType, params.search],
        queryFn: () => AdminAdService.list(params),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
        refetchOnWindowFocus: true,
    })
}
