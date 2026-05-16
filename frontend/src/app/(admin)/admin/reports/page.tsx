import type { Metadata } from "next"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { AdminReportsList } from "@/components/features/admin-reports/admin-reports-list"

export const metadata: Metadata = {
    title: "Модерація скарг | Kitypes Admin",
    description: "Управління скаргами користувачів на оголошення, профілі та повідомлення",
}

export default function AdminReportsPage() {
    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Скарги користувачів</h1>
                <p className="text-muted-foreground mt-1 font-medium text-[15px]">
                    Перегляд та модерація скарг на підозрілий контент або поведінку
                </p>
            </div>

            <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
                <AdminReportsList />
            </Suspense>
        </div>
    )
}
