"use client"

import { useEffect } from "react"
import { Loader2, PawPrint, Send } from "lucide-react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { useMessages } from "@/hook/useMessages"
import { usePublishMessage } from "@/hook/usePublishMessage"
import { useConversations } from "@/hook/useConversations"
import { useMarkMessageAsRead } from "@/hook/useMarkMessageAsRead"
import { useProfile } from "@/hook/useProfile"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn, formatChatDate } from "@/lib/utils"
import Link from "next/link"

const messageSchema = z.object({
    content: z.string().min(1, "Повідомлення не може бути порожнім").max(2000, "Максимум 2000 символів"),
})
type MessageFormValues = z.infer<typeof messageSchema>

interface ChatRoomProps {
    conversationId: string
}

export function ChatRoom({ conversationId }: ChatRoomProps) {
    const { user } = useProfile()
    const { data: convData } = useConversations()
    const {
        data: msgData,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useMessages(conversationId)

    const { mutate: publishMessage, isPending: isPublishing } = usePublishMessage()
    const { mutate: markAsRead } = useMarkMessageAsRead()

    const { register, handleSubmit, reset, watch, setValue } = useForm<MessageFormValues>({
        resolver: zodResolver(messageSchema),
        defaultValues: { content: "" },
    })
    const currentContent = watch("content")

    const currentChat = convData?.pages
        .flatMap(p => p.conversations)
        .find(c => c.id === conversationId)

    const messages = msgData?.pages.flatMap(p => p.messages) || []

    useEffect(() => {
        if (!user?.id || messages.length === 0) return

        const newestUnreadFromOther = messages.find(
            m => m.senderId !== user.id && !m.isRead
        )

        if (newestUnreadFromOther) {
            markAsRead({
                convId: conversationId,
                data: { lastReadMessageId: newestUnreadFromOther.id }
            })
        }
    }, [messages, user?.id, conversationId, markAsRead])

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget
        if (Math.abs(scrollTop) + clientHeight >= scrollHeight - 50 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
        }
    }

    const onSubmit = (data: MessageFormValues) => {
        const text = data.content.trim()
        if (!text) return

        reset()

        publishMessage(
            { conversationId, content: text },
            {
                onError: () => {
                    toast.error("Не вдалося відправити повідомлення")
                    setValue("content", text)
                }
            }
        )
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(onSubmit)()
        }
    }

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-white relative">
            <div className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-100 bg-white z-10 shrink-0">
                {currentChat && (
                    <>
                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                            {currentChat.user.avatarUrl ? (
                                <img src={currentChat.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-lg">
                                    {currentChat.user.firstName.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col justify-center min-w-0">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h2 className="font-extrabold text-gray-900 text-[15px] leading-tight">
                                    {currentChat.user.firstName} {currentChat.user.lastName}
                                </h2>
                                <Link
                                    href={`/ads/${currentChat.ad.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-colors flex items-center gap-1 shadow-sm"
                                >
                                    <PawPrint className="w-3 h-3" />
                                    <span className="truncate max-w-[200px]">{currentChat.ad.title}</span>
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div
                className="flex-1 overflow-y-auto flex flex-col-reverse p-5 gap-3 custom-scrollbar bg-slate-50/50"
                onScroll={handleScroll}
            >
                {messages.map((msg) => {
                    const isMine = msg.senderId === user?.id

                    return (
                        <div key={msg.id} className={cn("flex flex-col max-w-[75%]", isMine ? "self-end items-end" : "self-start items-start")}>
                            <div className={cn(
                                "px-3.5 py-2 text-[14px] break-words whitespace-pre-wrap shadow-sm",
                                isMine
                                    ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
                                    : "bg-white text-gray-900 rounded-2xl rounded-bl-sm border border-gray-100"
                            )}>
                                {msg.content}
                            </div>
                            <div className="flex items-center gap-1 mt-1 px-1.5">
                                <span className="text-[10px] font-medium text-gray-400">
                                    {formatChatDate(msg.createdAt)}
                                </span>
                                {isMine && (
                                    <span className={cn("text-[10px] font-bold", msg.isRead ? "text-primary" : "text-primary/40")}>
                                        {msg.isRead ? "✓✓" : "✓"}
                                    </span>
                                )}
                            </div>
                        </div>
                    )
                })}

                {isFetchingNextPage && (
                    <div className="flex justify-center py-2">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
                    </div>
                )}
            </div>

            <div className="p-3 bg-white border-t border-gray-100 shrink-0">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex items-end gap-2 bg-gray-50 p-1 rounded-[1.25rem] border border-gray-200 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all"
                >
                    <Textarea
                        {...register("content")}
                        onKeyDown={onKeyDown}
                        placeholder="Напишіть повідомлення..."
                        className="min-h-[36px] max-h-[100px] w-full bg-transparent border-0 focus-visible:ring-0 shadow-none resize-none py-[9px] px-4 text-[14px] custom-scrollbar leading-tight flex items-center"
                        rows={1}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="rounded-full w-9 h-9 shrink-0 bg-primary hover:bg-primary/90 shadow-sm transition-transform active:scale-95 disabled:bg-gray-200 disabled:shadow-none disabled:opacity-50 flex items-center justify-center m-0.5"
                        disabled={!currentContent?.trim() || isPublishing}
                    >
                        {isPublishing ? (
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                        ) : (
                            <Send className="w-4 h-4 text-white relative -ml-[2px] mt-[2px]" />
                        )}
                    </Button>
                </form>
            </div>
        </div>
    )
}
