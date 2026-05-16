import { api } from "@/lib/axios"
import { GetUserPhoneResponse, PublicUserResponse, UpdateEmailRequest, UpdatePasswordRequest, UpdateUserRequest, UploadUrlResponse, User, UserResponse } from "./user.interface"

const USERS_URL = "/v1/users"

export class UserService {
    static async getMe(): Promise<User> {
        const resp = await api.get<UserResponse>(`${USERS_URL}/me`)
        return resp.data.user
    }

    static async update(data: UpdateUserRequest): Promise<User> {
        const resp = await api.patch<UserResponse>(`${USERS_URL}/me`, data)
        return resp.data.user
    }

    static async updateEmail(data: UpdateEmailRequest): Promise<void> {
        await api.patch(`${USERS_URL}/me/email`, data)
    }

    static async updatePassword(data: UpdatePasswordRequest): Promise<void> {
        await api.patch(`${USERS_URL}/me/password`, data)
    }

    static async deleteAccount(): Promise<void> {
        await api.delete(`${USERS_URL}/me`)
    }

    static async deleteAvatar(): Promise<void> {
        await api.delete(`${USERS_URL}/me/avatar`)
    }

    static async getUploadUrl(ext: string): Promise<UploadUrlResponse> {
        const resp = await api.get<UploadUrlResponse>(`${USERS_URL}/upload-url?ext=${ext}`)
        return resp.data;
    }

    static async getPublicUser(userId: string): Promise<PublicUserResponse> {
        const resp = await api.get<PublicUserResponse>(`/v1/users/${userId}`);
        return resp.data;
    }

    static async getUserPhone(userId: string): Promise<GetUserPhoneResponse> {
        const resp = await api.get<GetUserPhoneResponse>(`/v1/users/${userId}/phone`);
        return resp.data;
    }
}
