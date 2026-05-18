import { useMutation } from "@tanstack/react-query"
import { AuthService } from "@/service/auth/auth.service"

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: (email: string) => AuthService.forgotPassword(email),
    })
}
