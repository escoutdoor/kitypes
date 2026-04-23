import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AdService } from "@/service/ad/ad.service"

export const useChangeAdStatus = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: number }) =>
            AdService.changeStatus(id, status),

        onMutate: async ({ id, status }) => {
            await queryClient.cancelQueries({ queryKey: ["my-ads"] })

            queryClient.setQueriesData({ queryKey: ["my-ads"] }, (oldData: any) => {
                if (!oldData?.advertisements) return oldData
                return {
                    ...oldData,
                    advertisements: oldData.advertisements.map((ad: any) =>
                        ad.id === id ? { ...ad, status } : ad
                    ),
                }
            })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["my-ads"] })
            queryClient.invalidateQueries({ queryKey: ["ads"] })
        }
    })
}
