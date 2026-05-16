import type { Metadata } from "next"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { AdminAdsList } from "@/components/features/admin-ads/admin-ads-list"

export const metadata: Metadata = {
    title: "Оголошення | Kitypes Admin",
    description: "Управління оголошеннями користувачів",
}

export default function AdminAdsPage() {
    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Оголошення</h1>
                <p className="text-muted-foreground mt-1 font-medium text-[15px]">
                    Перегляд та модерація усіх оголошень на платформі
                </p>
            </div>

            <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
                <AdminAdsList />
            </Suspense>
        </div>
    )
}
