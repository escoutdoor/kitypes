import { api } from "@/lib/axios";
import { ListAdminUsersParams, ListAdminUsersResponse, UpdateUserRoleRequest } from "./admin-user.interface";

const ADMIN_USERS_PREFIX = "/v1/admin/users";

export class AdminUserService {
    static async list(params?: ListAdminUsersParams): Promise<ListAdminUsersResponse> {
        const resp = await api.get<ListAdminUsersResponse>(`${ADMIN_USERS_PREFIX}`, { params });
        return resp.data;
    }

    static async updateRole(userId: string, data: UpdateUserRoleRequest): Promise<void> {
        await api.patch(`${ADMIN_USERS_PREFIX}/${userId}/role`, data);
    }

    static async ban(userId: string): Promise<void> {
        await api.patch(`${ADMIN_USERS_PREFIX}/${userId}/ban`);
    }

    static async unban(userId: string): Promise<void> {
        await api.patch(`${ADMIN_USERS_PREFIX}/${userId}/unban`);
    }
}
