import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ChatService } from "@/service/chat/chat.service"
import { PublishMessageRequest } from "@/service/chat/chat.interface"

export const usePublishMessage = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: PublishMessageRequest) => ChatService.publish(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] })

            if (variables.conversationId) {
                queryClient.invalidateQueries({ queryKey: ["messages", variables.conversationId] })
            }
        }
    })
}
