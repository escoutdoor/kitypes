import { useInfiniteQuery } from "@tanstack/react-query"
import { ChatService } from "@/service/chat/chat.service"
import { useAuthStore } from "@/store/auth.store"

// useConversations реалізує нескінченну пагінацію списку діалогів (cursor-based).
// pageToken використовується як курсор для ефективного скролу великих списків.
// Запит активується лише при автентифікації.
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
