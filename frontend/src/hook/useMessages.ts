import { useInfiniteQuery } from "@tanstack/react-query"
import { ChatService } from "@/service/chat/chat.service"

// useMessages реалізує нескінченну пагінацію повідомлень у діалозі (reverse scroll).
// conversationId є обов'язковим параметром; запит активується лише при його наявності.
export const useMessages = (conversationId: string, pageSize: number = 20) => {
    return useInfiniteQuery({
        queryKey: ["messages", conversationId],
        queryFn: ({ pageParam }) => ChatService.listMessages(conversationId, { pageSize, pageToken: pageParam }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.nextPageToken || undefined,
        enabled: !!conversationId,
    })
}
