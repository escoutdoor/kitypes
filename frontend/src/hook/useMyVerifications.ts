import { useQuery } from "@tanstack/react-query"
import { VerificationService } from "@/service/verification/verification.service"
import { ListMyVerificationsParams } from "@/service/verification/verification.interface"

export const useMyVerifications = (params: ListMyVerificationsParams = {}) => {
    return useQuery({
        queryKey: ["my-verifications", params.limit, params.offset, params.status],
        queryFn: () => VerificationService.listMy(params),
        placeholderData: (prev) => prev,
        staleTime: 60_000,
        refetchOnWindowFocus: true,
    })
}
