"use client"

import { usePathname } from "next/navigation"
import { Loader2, MessageSquareOff } from "lucide-react"

import { useConversations } from "@/hook/useConversations"
import { useProfile } from "@/hook/useProfile"
import { ChatCard } from "./chat-card"

export function MessagesLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useConversations()

    const { user } = useProfile()

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget
        if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
        }
    }

    const conversations = data?.pages.flatMap(page => page.conversations) || []

    return (
        <div className="w-full h-[calc(100vh-140px)] min-h-[600px] flex flex-col pb-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-6 hidden md:block">
                Повідомлення
            </h1>

            <div className="flex flex-1 bg-white rounded-3xl shadow-sm border border-gray-100/80 overflow-hidden">
                <div className="w-full md:w-[320px] lg:w-[380px] flex-shrink-0 border-r border-gray-100 flex flex-col bg-gray-50/40">
                    <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar" onScroll={handleScroll}>
                        {isLoading ? (
                            <div className="flex justify-center p-10">
                                <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4 px-6 text-center">
                                <div className="p-4 bg-white rounded-full shadow-sm">
                                    <MessageSquareOff className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-base font-medium text-gray-500">Немає активних чатів</p>
                                <p className="text-sm">Тут з'являться ваші розмови щодо адопції тварин.</p>
                            </div>
                        ) : (
                            conversations.map((chat) => (
                                <ChatCard
                                    key={chat.id}
                                    chat={chat}
                                    isActive={pathname === `/messages/${chat.id}`}
                                    currentUserId={user?.id}
                                />
                            ))
                        )}
                        {isFetchingNextPage && (
                            <div className="flex justify-center p-4">
                                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="hidden md:flex flex-1 flex-col bg-white relative">
                    {children}
                </div>
            </div>
        </div>
    )
}
