import { useQuery } from "@tanstack/react-query"
import { UserService } from "@/service/user/user.service"
import { PublicUserResponse } from "@/service/user/user.interface"

export const usePublicUser = (userId: string, initialData?: PublicUserResponse) => {
    return useQuery({
        queryKey: ["public-user", userId],
        queryFn: () => UserService.getPublicUser(userId),
        enabled: !!userId,
        initialData,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    })
}
