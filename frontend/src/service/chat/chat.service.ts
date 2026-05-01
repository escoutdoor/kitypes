import { api } from "@/lib/axios"
import {
    ConversationsListResponse,
    MessagesHistoryResponse,
    PublishMessageRequest,
    MarkMessageAsReadRequest,
    ListChatParams
} from "./chat.interface"

const CHATS_PREFIX = "/v1/conversations"

export class ChatService {
    static async listConversations(params?: ListChatParams): Promise<ConversationsListResponse> {
        const resp = await api.get<ConversationsListResponse>(`${CHATS_PREFIX}/`, { params })
        return resp.data
    }

    static async listMessages(convId: string, params?: ListChatParams): Promise<MessagesHistoryResponse> {
        const resp = await api.get<MessagesHistoryResponse>(`${CHATS_PREFIX}/${convId}/messages`, { params })
        return resp.data
    }

    static async publish(data: PublishMessageRequest): Promise<void> {
        await api.post(`${CHATS_PREFIX}/publish`, data)
    }

    static async markAsRead(convId: string, data: MarkMessageAsReadRequest): Promise<void> {
        await api.patch(`${CHATS_PREFIX}/${convId}/read`, data)
    }
}
