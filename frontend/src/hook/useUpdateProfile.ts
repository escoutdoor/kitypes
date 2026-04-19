import { useMutation, useQueryClient } from "@tanstack/react-query"
import { UserService } from "@/service/user/user.service"
import { UpdateUserRequest } from "@/service/user/user.interface"

export const useUpdateProfile = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: UpdateUserRequest) => UserService.update(data),
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(["profile"], (old: any) => ({
                ...old,
                ...updatedUser,
            }))
        },
        onError: (error) => {
            console.error("update profile error", error)
        },
    })
}
