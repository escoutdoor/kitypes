import { useQuery } from "@tanstack/react-query";
import { UserService } from "@/service/user/user.service";

export const usePublicUser = (userId: string) => {
    return useQuery({
        queryKey: ["public-user", userId],
        queryFn: () => UserService.getPublicUser(userId),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};
