import { useMutation } from "@tanstack/react-query"
import { AuthService } from "@/service/auth/auth.service"

export const useResetPassword = () => {
    return useMutation({
        mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
            AuthService.resetPassword(token, newPassword),
    })
}
