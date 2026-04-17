import { create } from "zustand"
import { LoginRequest, RegisterRequest } from '@/service/auth/auth.interface';
import { AuthService } from "@/service/auth/auth.service";

interface AuthState {
    accessToken: string | null;
    isAuthenticated: boolean;
    isInitializing: boolean;

    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    checkAuth: () => Promise<void>;
    logout: () => Promise<void>;
    setAccessToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    isAuthenticated: false,
    isInitializing: true,

    login: async (data) => {
        const resp = await AuthService.login(data);
        set({ accessToken: resp.accessToken, isAuthenticated: true });
    },

    register: async (data) => {
        const resp = await AuthService.register(data);
        set({ accessToken: resp.accessToken, isAuthenticated: true });
    },

    checkAuth: async () => {
        try {
            const resp = await AuthService.refreshToken();
            set({ accessToken: resp.accessToken, isAuthenticated: true, isInitializing: false });
        } catch (error) {
            set({ accessToken: null, isAuthenticated: false, isInitializing: false });
        }
    },

    logout: async () => {
        try {
            await AuthService.logout();
        } finally {
            set({ accessToken: null, isAuthenticated: false });
        }
    },

    setAccessToken: (token) => set({ accessToken: token, isAuthenticated: !!token }),
}));
