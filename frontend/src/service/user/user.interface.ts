export interface User {
    id: string
    avatarUrl: string
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    createdAt: string
    updatedAt: string
}

export interface UserResponse {
    user: User
}

export interface UpdateUserRequest {
    firstName?: string
    lastName?: string
    phoneNumber?: string
    avatarKey?: string
}

export interface UploadUrlResponse {
    uploadUrl: string
    avatarKey: string
}

export interface UpdateEmailRequest {
    email: string
    password: string
}

export interface UpdatePasswordRequest {
    oldPassword: string
    newPassword: string
}
