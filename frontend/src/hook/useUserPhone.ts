import { useMutation } from "@tanstack/react-query";
import { UserService } from "@/service/user/user.service";

export const useUserPhone = () => {
    return useMutation({
        mutationFn: (userId: string) => UserService.getUserPhone(userId),
    });
};
