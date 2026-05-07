import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AdminVerificationService } from "@/service/admin-verification/admin-verification.service"
import {
    UpdateVerificationStatusRequest,
    ListAdminVerificationsResponse
} from "@/service/admin-verification/admin-verification.interface"

export const useUpdateVerificationStatus = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateVerificationStatusRequest }) =>
            AdminVerificationService.updateStatus(id, data),

        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: ["admin-verifications"] })

            const previousQueries = queryClient.getQueriesData({ queryKey: ["admin-verifications"] })

            queryClient.setQueriesData(
                { queryKey: ["admin-verifications"] },
                (oldData: ListAdminVerificationsResponse | undefined) => {
                    if (!oldData?.requests) return oldData

                    return {
                        ...oldData,
                        requests: oldData.requests.map((req) =>
                            req.id === id ? { ...req, status: data.status, adminNotes: data.adminNotes } : req
                        ),
                    }
                }
            )

            return { previousQueries }
        },

        onError: (_err, _newStatus, context) => {
            if (context?.previousQueries) {
                context.previousQueries.forEach(([queryKey, oldData]) => {
                    queryClient.setQueryData(queryKey, oldData)
                })
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-verifications"] })
        },
    })
}
