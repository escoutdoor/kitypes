import { api } from "@/lib/axios"
import { AuthResponse, LoginRequest, RegisterRequest } from "./auth.interface"

const AUTH_URL = "/v1/auth"

export class AuthService {
	static async login(data: LoginRequest): Promise<AuthResponse> {
		const resp = await api<AuthResponse>({
			method: "POST",
			url: `${AUTH_URL}/login`,
			data: {
				email: data.email,
				password: data.password,
			},
		})

		return resp.data
	}

	static async register(data: RegisterRequest): Promise<AuthResponse> {
		const resp = await api<AuthResponse>({
			method: "POST",
			url: `${AUTH_URL}/register`,
			data: {
				firstName: data.firstName,
				lastName: data.lastName,
				phoneNumber: data.phoneNumber,
				email: data.email,
				password: data.password,
			},
		})

		return resp.data
	}

	static async logout() {
		return api.post(`${AUTH_URL}/logout`)
	}
}
