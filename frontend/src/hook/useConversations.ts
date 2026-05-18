import { useInfiniteQuery } from "@tanstack/react-query"
import { ChatService } from "@/service/chat/chat.service"
import { useAuthStore } from "@/store/auth.store"

export const useConversations = (pageSize: number = 20) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

    return useInfiniteQuery({
        queryKey: ["conversations"],
        queryFn: ({ pageParam }) => ChatService.listConversations({ pageSize, pageToken: pageParam }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.nextPageToken || undefined,

        enabled: isAuthenticated,
    })
}
