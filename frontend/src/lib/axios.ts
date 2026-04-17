import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios"
import { useAuthStore } from "@/store/auth.store"

export interface CustomRequestConfig extends AxiosRequestConfig {
    _skipAuthRefresh?: boolean
}

interface CustomInternalRequestConfig extends InternalAxiosRequestConfig {
    _isRetry?: boolean
    _skipAuthRefresh?: boolean
}

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
})

api.interceptors.request.use(config => {
    const token = useAuthStore.getState().accessToken;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})

api.interceptors.response.use(
    (config) => config,
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomInternalRequestConfig;
        if (originalRequest._skipAuthRefresh) {
            return Promise.reject(error)
        }

        if (error.response?.status === 401 && originalRequest && !originalRequest._isRetry) {
            originalRequest._isRetry = true;

            try {
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                const newToken = response.data.accessToken;

                // update zustand
                useAuthStore.getState().setAccessToken(newToken);

                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api.request(originalRequest);
            } catch (e) {
                // failed to update - logout
                useAuthStore.getState().setAccessToken(null);
                return Promise.reject(e);
            }
        }
        throw error;
    }
);
