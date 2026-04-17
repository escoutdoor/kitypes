"use client"

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function GuestGuard({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isInitializing = useAuthStore((state) => state.isInitializing);
    const router = useRouter();

    useEffect(() => {
        if (!isInitializing && isAuthenticated) {
            // user is logged in
            router.replace("/");
        }
    }, [isAuthenticated, isInitializing, router]);

    if (isInitializing || isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return <>{children}</>;
}
