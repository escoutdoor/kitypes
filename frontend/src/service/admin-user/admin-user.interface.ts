import { User, UserRole } from "../user/user.interface"

export interface ListAdminUsersParams {
    limit?: number
    offset?: number
    search?: string
    id?: string
    role?: UserRole
    isBanned?: boolean
}

export interface ListAdminUsersResponse {
    users: User[]
    total: number
}

export interface UpdateUserRoleRequest {
    role: UserRole
}
