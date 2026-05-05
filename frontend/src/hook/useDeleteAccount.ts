import { UserService } from "@/service/user/user.service"
import { useMutation } from "@tanstack/react-query"

export const useDeleteAccount = () => {
    return useMutation({
        mutationFn: () => UserService.deleteAccount(),
    })
}
