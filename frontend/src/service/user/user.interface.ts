export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
}

export interface UserResponse {
    user: User
}

export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
}
