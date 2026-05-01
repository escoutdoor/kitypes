"use client"

import { useChatWebSocket } from "@/hook/useChatWebSocket"

export function ChatWsProvider() {
    useChatWebSocket()
    return null
}
