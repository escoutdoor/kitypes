import { useMutation, useQueryClient } from "@tanstack/react-query"
import { VerificationService } from "@/service/verification/verification.service"
import { CreateVerificationRequest } from "@/service/verification/verification.interface"

export const useCreateVerification = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateVerificationRequest) => VerificationService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-verifications"] })

            queryClient.invalidateQueries({ queryKey: ["profile"] })
        },
    })
}

