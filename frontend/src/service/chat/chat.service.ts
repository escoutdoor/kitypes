import { api } from "@/lib/axios"
import {
    ConversationsListResponse,
    MessagesHistoryResponse,
    PublishMessageRequest,
    MarkMessageAsReadRequest,
    ListChatParams,
    MessageResponse,
    SingleMessageResponse
} from "./chat.interface"

const CHATS_PREFIX = "/v1/conversations"
const ADMIN_MESSAGES_PREFIX = "/v1/admin/messages"

export class ChatService {
    static async listConversations(params?: ListChatParams): Promise<ConversationsListResponse> {
        const resp = await api.get<ConversationsListResponse>(`${CHATS_PREFIX}`, { params })
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

    static async getAdminMessage(messageId: string): Promise<MessageResponse> {
        const resp = await api.get<SingleMessageResponse>(`${ADMIN_MESSAGES_PREFIX}/${messageId}`)
        return resp.data.message
    }
}
