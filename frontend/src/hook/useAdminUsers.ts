import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AdminUserService } from "@/service/admin-user/admin-user.service";
import { ListAdminUsersParams } from "@/service/admin-user/admin-user.interface";

export const useAdminUsers = (params: ListAdminUsersParams) => {
    return useQuery({
        queryKey: ["admin-users", params.limit, params.offset, params.search, params.id, params.role, params.isBanned],
        queryFn: () => AdminUserService.list(params),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
        refetchOnWindowFocus: true,
    });
};
