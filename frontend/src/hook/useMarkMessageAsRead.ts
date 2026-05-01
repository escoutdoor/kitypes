import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ChatService } from "@/service/chat/chat.service"
import { MarkMessageAsReadRequest, MessageResponse } from "@/service/chat/chat.interface"

export const useMarkMessageAsRead = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ convId, data }: { convId: string; data: MarkMessageAsReadRequest }) =>
            ChatService.markAsRead(convId, data),
        onMutate: async ({ convId }) => {
            await queryClient.cancelQueries({ queryKey: ["messages", convId] })

            const previousMessages = queryClient.getQueryData(["messages", convId])

            queryClient.setQueryData(["messages", convId], (oldData: any) => {
                if (!oldData?.pages) return oldData
                return {
                    ...oldData,
                    pages: oldData.pages.map((page: any) => ({
                        ...page,
                        messages: page.messages.map((m: MessageResponse) => ({ ...m, isRead: true }))
                    }))
                }
            })

            return { previousMessages, convId }
        },
        onError: (_, __, context) => {
            if (context?.previousMessages) {
                queryClient.setQueryData(["messages", context.convId], context.previousMessages)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] })
        }
    })
}
