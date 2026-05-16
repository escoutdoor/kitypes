import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminUserService } from "@/service/admin-user/admin-user.service";
import { UpdateUserRoleRequest } from "@/service/admin-user/admin-user.interface";
import { ListAdminUsersResponse } from "@/service/admin-user/admin-user.interface";
import { User } from "@/service/user/user.interface";

export const useUpdateUserRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateUserRoleRequest }) => AdminUserService.updateRole(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: ["admin-users"] });
            const previousQueries = queryClient.getQueriesData<ListAdminUsersResponse>({ queryKey: ["admin-users"] });

            queryClient.setQueriesData({ queryKey: ["admin-users"] }, (oldData: ListAdminUsersResponse | undefined) => {
                if (!oldData?.users) return oldData;
                return {
                    ...oldData,
                    users: oldData.users.map((u) => u.id === id ? { ...u, role: data.role } : u),
                };
            });
            return { previousQueries };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousQueries) {
                context.previousQueries.forEach(([queryKey, oldData]) => queryClient.setQueryData(queryKey, oldData));
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        },
    });
};

export const useBanAdminUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => AdminUserService.ban(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ["admin-users"] });
            const previousQueries = queryClient.getQueriesData<ListAdminUsersResponse>({ queryKey: ["admin-users"] });

            queryClient.setQueriesData({ queryKey: ["admin-users"] }, (oldData: ListAdminUsersResponse | undefined) => {
                if (!oldData?.users) return oldData;
                return {
                    ...oldData,
                    users: oldData.users.map((u) => u.id === id ? { ...u, isBanned: true } : u),
                };
            });
            return { previousQueries };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousQueries) {
                context.previousQueries.forEach(([queryKey, oldData]) => queryClient.setQueryData(queryKey, oldData));
            }
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
    });
};

export const useUnbanAdminUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => AdminUserService.unban(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ["admin-users"] });
            const previousQueries = queryClient.getQueriesData<ListAdminUsersResponse>({ queryKey: ["admin-users"] });

            queryClient.setQueriesData({ queryKey: ["admin-users"] }, (oldData: ListAdminUsersResponse | undefined) => {
                if (!oldData?.users) return oldData;
                return {
                    ...oldData,
                    users: oldData.users.map((u) => u.id === id ? { ...u, isBanned: false } : u),
                };
            });
            return { previousQueries };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousQueries) {
                context.previousQueries.forEach(([queryKey, oldData]) => queryClient.setQueryData(queryKey, oldData));
            }
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
    });
};
