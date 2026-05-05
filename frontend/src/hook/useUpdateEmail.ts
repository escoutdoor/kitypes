import { UserService } from "@/service/user/user.service"
import { UpdateEmailRequest } from "@/service/user/user.interface"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useUpdateEmail = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: UpdateEmailRequest) => UserService.updateEmail(data),
        onSuccess: (_, variables) => {
            queryClient.setQueryData(["profile"], (old: any) => {
                if (!old) return old
                return { ...old, email: variables.email }
            })
        },
    })
}
