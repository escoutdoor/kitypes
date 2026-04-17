import { AuthResponse, LoginRequest, RegisterRequest } from "./auth.interface"
import { api, CustomRequestConfig } from "@/lib/axios"

const AUTH_URL = "/v1/auth"

export class AuthService {
    static async login(data: LoginRequest): Promise<AuthResponse> {
        const config: CustomRequestConfig = { _skipAuthRefresh: true };

        const resp = await api.post<AuthResponse>(`${AUTH_URL}/login`, {
            email: data.email,
            password: data.password,
        }, config)

        return resp.data
    }

    static async register(data: RegisterRequest): Promise<AuthResponse> {
        const config: CustomRequestConfig = { _skipAuthRefresh: true };

        const resp = await api.post<AuthResponse>(`${AUTH_URL}/register`, {
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber,
            email: data.email,
            password: data.password,
        }, config)

        return resp.data
    }

    static async refreshToken(): Promise<AuthResponse> {
        const config: CustomRequestConfig = { _skipAuthRefresh: true }

        const resp = await api.post<AuthResponse>(`${AUTH_URL}/refresh`, {}, config)
        return resp.data
    }

    static async logout() {
        const config: CustomRequestConfig = { _skipAuthRefresh: true };

        return api.post(`${AUTH_URL}/logout`, {}, config)
    }
}
