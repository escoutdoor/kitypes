"use client"

import Link from "next/link"
import { PawPrint } from "lucide-react"
import { cn, formatChatDate } from "@/lib/utils"
import { ConversationListItemResponse } from "@/service/chat/chat.interface"
import { VerificationBadge } from "@/components/shared/verification-badge/verification-badge"

interface ChatCardProps {
    chat: ConversationListItemResponse
    isActive: boolean
    currentUserId: string | undefined
}

export function ChatCard({ chat, isActive, currentUserId }: ChatCardProps) {
    const fallbackAvatar = chat.user.firstName.charAt(0).toUpperCase()

    const hasUnread = chat.lastMessage &&
        !chat.lastMessage.isRead &&
        chat.lastMessage.senderId !== currentUserId

    return (
        <Link
            href={`/messages/${chat.id}`}
            className={cn(
                "relative flex items-start gap-3 p-3 rounded-2xl transition-all duration-200 cursor-pointer border mb-2",
                isActive
                    ? "bg-primary/5 border-primary/20 shadow-sm ring-1 ring-primary/10"
                    : "bg-white border-gray-200 shadow-sm hover:border-primary/30 hover:shadow-md"
            )}
        >
            <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border border-gray-200">
                    {chat.user.avatarUrl ? (
                        <img src={chat.user.avatarUrl} alt={chat.user.firstName} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-base font-bold text-gray-500">{fallbackAvatar}</span>
                    )}
                </div>

                {hasUnread && (
                    <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-orange-500 border-2 border-white rounded-full shadow-sm"></div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0 pr-2">
                        <h3 className="font-bold text-gray-900 text-sm truncate">
                            {chat.user.firstName} {chat.user.lastName}
                        </h3>
                        <VerificationBadge role={chat.user.role} size="sm" />
                    </div>

                    <span className="text-[10px] font-medium text-gray-400 flex-shrink-0">
                        {formatChatDate(chat.lastMessage ? chat.lastMessage.createdAt : chat.createdAt)}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 mb-1">
                    <PawPrint className="w-3 h-3 text-primary/70" />
                    <p className="text-[11px] font-semibold text-gray-600 truncate">
                        {chat.ad.title}
                    </p>
                </div>

                <p className={cn(
                    "text-[13px] truncate leading-tight",
                    hasUnread ? "font-bold text-gray-900" : "text-gray-500 font-medium"
                )}>
                    {chat.lastMessage ? chat.lastMessage.content : "Напишіть перше повідомлення..."}
                </p>
            </div>
        </Link>
    )
}
