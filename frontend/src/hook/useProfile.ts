import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { UserService } from "@/service/user/user.service";

export const useProfile = () => {
    const { isAuthenticated, isInitializing } = useAuthStore();

    const query = useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const user = await UserService.getMe()
            return user
        },

        enabled: isAuthenticated && !isInitializing,

        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    return {
        user: query.data,
        isLoadingProfile: query.isLoading && isAuthenticated,
        error: query.error,
    };
};
