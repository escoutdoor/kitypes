"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useProfile } from "@/hook/useProfile"
import { Loader } from "@/components/ui/loader"

export function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoadingProfile } = useProfile()
    const router = useRouter()

    useEffect(() => {
        if (!isLoadingProfile && user && user.role !== "admin") {
            router.replace("/")
        }
    }, [user, isLoadingProfile, router])

    if (isLoadingProfile || !user || user.role !== "admin") {
        return <Loader fullScreen />
    }

    return <>{children}</>
}
