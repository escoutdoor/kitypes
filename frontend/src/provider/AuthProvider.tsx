"use client"

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { Loader } from "@/components/ui/loader";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const checkAuth = useAuthStore((state) => state.checkAuth);
    const isInitializing = useAuthStore((state) => state.isInitializing);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isInitializing) {
        return (
            <Loader fullScreen />
        );
    }

    return <>{children}</>;
}
