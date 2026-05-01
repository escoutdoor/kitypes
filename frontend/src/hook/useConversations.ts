import { useInfiniteQuery } from "@tanstack/react-query"
import { ChatService } from "@/service/chat/chat.service"

export const useConversations = (pageSize: number = 20) => {
    return useInfiniteQuery({
        queryKey: ["conversations"],
        queryFn: ({ pageParam }) => ChatService.listConversations({ pageSize, pageToken: pageParam }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.nextPageToken || undefined,
    })
}
