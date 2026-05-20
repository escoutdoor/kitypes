import type { Metadata } from "next"
import { AdminUsersList } from "@/components/features/admin-users/admin-users-list"

export const metadata: Metadata = {
    title: "Користувачі",
    description: "Управління користувачами платформи",
}

export default function AdminUsersPage() {
    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Користувачі</h1>
                <p className="text-muted-foreground mt-1 font-medium text-[15px]">
                    Перегляд профілів, управління ролями та блокування порушників
                </p>
            </div>

            <AdminUsersList />
        </div>
    )
}
