import { useQuery } from "@tanstack/react-query"
import { AdminVerificationService } from "@/service/admin-verification/admin-verification.service"
import { ListAdminVerificationsParams } from "@/service/admin-verification/admin-verification.interface"

export const useAdminVerifications = (params: ListAdminVerificationsParams) => {
    return useQuery({
        queryKey: ["admin-verifications", params.limit, params.offset, params.status, params.query],
        queryFn: () => AdminVerificationService.list(params),
        placeholderData: (prev) => prev,
        staleTime: 30_000,
        refetchOnWindowFocus: true,
    })
}
