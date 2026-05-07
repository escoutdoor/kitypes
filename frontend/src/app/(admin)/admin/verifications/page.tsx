import type { Metadata } from "next"
import { AdminVerificationList } from "@/components/features/admin-verification/admin-verification-list"

export const metadata: Metadata = {
    title: "Модерація верифікацій | Kitypes Admin",
    description: "Управління заявками на верифікацію користувачів",
}

export default function AdminVerificationsPage() {
    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Заявки на верифікацію</h1>
                <p className="text-muted-foreground mt-1 font-medium text-[15px]">
                    Перегляд та модерація запитів на статус волонтера або притулку
                </p>
            </div>

            <AdminVerificationList />
        </div>
    )
}
