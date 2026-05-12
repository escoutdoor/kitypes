import { UserRole } from "../user/user.interface"

export interface MessageResponse {
    id: string
    conversationId: string
    senderId: string
    content: string
    isRead: boolean
    createdAt: string
}

export interface ConversationAdDTO {
    id: string
    title: string
    imageUrl: string
}

export interface ConversationUserDTO {
    id: string
    firstName: string
    lastName: string
    avatarUrl: string
    role: UserRole
}

export interface ConversationListItemResponse {
    id: string
    ad: ConversationAdDTO
    user: ConversationUserDTO
    lastMessage?: MessageResponse
    createdAt: string
}

export interface ConversationsListResponse {
    conversations: ConversationListItemResponse[]
    nextPageToken?: string
}

export interface MessagesHistoryResponse {
    messages: MessageResponse[]
    nextPageToken?: string
}

export interface PublishMessageRequest {
    content: string
    adId?: string
    conversationId?: string
}

export interface MarkMessageAsReadRequest {
    lastReadMessageId: string
}

export interface ListChatParams {
    pageSize?: number
    pageToken?: string
}

export interface SingleMessageResponse {
    message: MessageResponse
}
