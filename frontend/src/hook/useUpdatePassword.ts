import { UserService } from "@/service/user/user.service"
import { UpdatePasswordRequest } from "@/service/user/user.interface"
import { useMutation } from "@tanstack/react-query"

export const useUpdatePassword = () => {
    return useMutation({
        mutationFn: (data: UpdatePasswordRequest) => UserService.updatePassword(data),
    })
}
