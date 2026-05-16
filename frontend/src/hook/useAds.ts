import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { AdService } from "@/service/ad/ad.service"
import { ListAdsParams } from "@/service/ad/ad.interface"

export const useAds = (params: ListAdsParams) => {
    const {
        limit,
        offset,
        sortBy,
        search,
        country,
        city,
        petType,
        petGender,
        status,
        minPetAgeMonth,
        maxPetAgeMonth,
        verifiedOnly,
        authorId,
    } = params

    return useQuery({
        queryKey: [
            "ads",
            limit ?? null,
            offset ?? null,
            sortBy ?? "dateDesc",
            search?.trim() || null,
            country?.trim() || null,
            city?.trim() || null,
            petType ?? null,
            petGender ?? null,
            status ?? null,
            minPetAgeMonth ?? null,
            maxPetAgeMonth ?? null,
            verifiedOnly ?? null,
            authorId ?? null,
        ],
        queryFn: () => AdService.list(params),

        placeholderData: keepPreviousData,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    })
}
