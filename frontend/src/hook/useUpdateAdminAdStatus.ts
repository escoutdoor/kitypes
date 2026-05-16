import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AdminAdService } from "@/service/admin-ad/admin-ad.service"
import { UpdateAdminAdStatusRequest } from "@/service/admin-ad/admin-ad.interface"

export const useUpdateAdminAdStatus = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateAdminAdStatusRequest }) =>
            AdminAdService.updateStatus(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["ad", variables.id] })
            queryClient.invalidateQueries({ queryKey: ["ads"] })
            queryClient.invalidateQueries({ queryKey: ["admin-ads"] })
        },
    })
}
