import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/store/auth.store"
import { MessageResponse } from "@/service/chat/chat.interface"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import { NewMessageToast } from "@/components/features/messages/new-message-toast"

export const useChatWebSocket = () => {
    const queryClient = useQueryClient()
    const accessToken = useAuthStore(state => state.accessToken)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const pathname = usePathname()
    const pathnameRef = useRef(pathname)

    useEffect(() => {
        pathnameRef.current = pathname
    }, [pathname])

    useEffect(() => {
        if (!accessToken) return

        let ws: WebSocket | null = null
        let reconnectAttempt = 0

        const connect = () => {
            const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3800"
            const wsProtocol = baseApiUrl.startsWith("https") ? "wss" : "ws"
            const wsBaseUrl = baseApiUrl.replace(/^https?/, wsProtocol)

            const wsUrl = `${wsBaseUrl}/v1/conversations/subscribe?token=${accessToken}`
            ws = new WebSocket(wsUrl)

            ws.onopen = () => {
                reconnectAttempt = 0
            }

            ws.onmessage = (event) => {
                try {
                    const envelope = JSON.parse(event.data)

                    if (!envelope || typeof envelope.type !== "string") return
                    if (!["message", "read"].includes(envelope.type)) return

                    switch (envelope.type) {
                        case "message": {
                            const raw = envelope.payload

                            const newMessage: MessageResponse = {
                                id: raw.ID,
                                conversationId: raw.ConversationID,
                                senderId: raw.SenderID,
                                content: raw.Content,
                                isRead: raw.IsRead,
                                createdAt: raw.CreatedAt,
                            }

                            queryClient.setQueryData(
                                ["messages", newMessage.conversationId],
                                (oldData: any) => {
                                    if (!oldData?.pages?.length) return oldData

                                    const alreadyExists = oldData.pages[0].messages.some(
                                        (m: MessageResponse) => m.id === newMessage.id
                                    )
                                    if (alreadyExists) return oldData

                                    const newPages = [...oldData.pages]
                                    newPages[0] = {
                                        ...newPages[0],
                                        messages: [newMessage, ...newPages[0].messages],
                                    }
                                    return { ...oldData, pages: newPages }
                                }
                            )

                            queryClient.setQueryData(["conversations"], (old: any) => {
                                if (!old?.pages?.length) return old
                                const newPages = old.pages.map((p: any) => ({
                                    ...p,
                                    conversations: p.conversations.map((c: any) =>
                                        c.id === newMessage.conversationId
                                            ? { ...c, lastMessage: newMessage }
                                            : c
                                    ),
                                }))
                                return { ...old, pages: newPages }
                            })

                            const isActiveChat = pathnameRef.current === `/messages/${newMessage.conversationId}`

                            if (!isActiveChat) {
                                const convCache: any = queryClient.getQueryData(["conversations"])
                                const conversations = convCache?.pages?.flatMap((p: any) => p.conversations) || []
                                const conv = conversations.find((c: any) => c.id === newMessage.conversationId)

                                const authorName = conv?.user ? `${conv.user.firstName} ${conv.user.lastName}` : "Нове повідомлення"
                                const adTitle = conv?.ad?.title || ""

                                toast.custom((t) => (
                                    <NewMessageToast
                                        authorName={authorName}
                                        adTitle={adTitle}
                                        content={newMessage.content}
                                        conversationId={newMessage.conversationId}
                                        toastId={t}
                                    />
                                ), {
                                    duration: 6000,
                                })
                            }

                            break
                        }

                        case "read": {
                            const read = envelope.payload
                            const convId = read.conversationId

                            queryClient.setQueryData(["messages", convId], (old: any) => {
                                if (!old?.pages?.length) return old

                                const lastId = read.lastReadMessageId
                                const readerId = read.readerId

                                const newPages = old.pages.map((p: any) => ({
                                    ...p,
                                    messages: p.messages.map((m: MessageResponse) =>
                                        m.senderId !== readerId && m.id <= lastId
                                            ? { ...m, isRead: true }
                                            : m
                                    ),
                                }))

                                return { ...old, pages: newPages }
                            })

                            queryClient.invalidateQueries({ queryKey: ["conversations"] })
                            break
                        }
                    }
                } catch (error) {
                    console.error("WS parse error", error)
                }
            }

            ws.onerror = (error) => {
                console.warn("WebSocket connection issue (reconnecting...)", error)
            }

            ws.onclose = () => {
                const delay = Math.min(1000 * (2 ** reconnectAttempt), 30000)
                reconnectAttempt++
                console.log(`WebSocket disconnected. Reconnecting in ${delay}ms...`)

                reconnectTimeoutRef.current = setTimeout(connect, delay)
            }
        }

        connect()

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }
            if (ws) {
                ws.onclose = null
                ws.close()
            }
        }
    }, [accessToken, queryClient])
}
