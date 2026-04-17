"use client"

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { Loader2 } from "lucide-react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const checkAuth = useAuthStore((state) => state.checkAuth);
    const isInitializing = useAuthStore((state) => state.isInitializing);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isInitializing) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return <>{children}</>;
}
