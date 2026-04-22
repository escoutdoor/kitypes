import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AdService } from "@/service/ad/ad.service"

export const useChangeAdStatus = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: number }) => AdService.changeStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-ads"] })
        }
    })
}
