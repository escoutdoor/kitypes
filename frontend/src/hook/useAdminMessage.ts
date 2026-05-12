import { useQuery } from "@tanstack/react-query"
import { ChatService } from "@/service/chat/chat.service"

export const useAdminMessage = (messageId: string | null) => {
    return useQuery({
        queryKey: ["admin-message", messageId],
        queryFn: () => ChatService.getAdminMessage(messageId as string),
        enabled: !!messageId,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    })
}
