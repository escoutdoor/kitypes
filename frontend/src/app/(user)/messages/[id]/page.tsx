import { Metadata } from "next"
import { ChatRoom } from "@/components/features/messages/chat-room"

export const metadata: Metadata = {
    title: "Чат | KityPes",
}

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    return <ChatRoom conversationId={id} />
}
