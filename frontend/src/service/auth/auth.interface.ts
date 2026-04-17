export interface AuthResponse {
	accessToken: string
}

export interface LoginRequest {
	email: string
	password: string
}

export interface RegisterRequest {
	firstName: string
	lastName: string
	phoneNumber: string
	email: string
	password: string
}
