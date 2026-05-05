import { UserService } from "@/service/user/user.service"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useDeleteAvatar = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => UserService.deleteAvatar(),
        onSuccess: () => {
            queryClient.setQueryData(["profile"], (old: any) => ({
                ...old,
                avatarUrl: null,
            }))
        },
        onError: (error) => {
            console.error("delete avatar error", error)
        },
    })
}
