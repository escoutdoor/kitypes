"use client"

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/ui/loader";

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isInitializing = useAuthStore((state) => state.isInitializing);
    const router = useRouter();

    useEffect(() => {
        // initialized but not logged in
        if (!isInitializing && !isAuthenticated) {
            router.replace("/login");
        }
    }, [isAuthenticated, isInitializing, router]);

    if (isInitializing || !isAuthenticated) {
        return (
            <Loader fullScreen />
        );
    }

    return <>{children}</>;
}
