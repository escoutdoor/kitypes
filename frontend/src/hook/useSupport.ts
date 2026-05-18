import { useMutation } from "@tanstack/react-query"
import { SupportService } from "@/service/support/support.service"
import { SendContactRequest } from "@/service/support/support.interface"

export const useSendSupportMessage = () => {
    return useMutation({
        mutationFn: (data: SendContactRequest) => SupportService.sendContactMessage(data),
    })
}
