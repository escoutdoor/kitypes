import { useInfiniteQuery } from "@tanstack/react-query"
import { ChatService } from "@/service/chat/chat.service"

export const useMessages = (conversationId: string, pageSize: number = 20) => {
    return useInfiniteQuery({
        queryKey: ["messages", conversationId],
        queryFn: ({ pageParam }) => ChatService.listMessages(conversationId, { pageSize, pageToken: pageParam }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.nextPageToken || undefined,
        enabled: !!conversationId,
    })
}
