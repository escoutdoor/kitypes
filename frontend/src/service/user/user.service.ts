import { api } from "@/lib/axios"
import { UpdateUserRequest, User, UserResponse } from "./user.interface"

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
}
