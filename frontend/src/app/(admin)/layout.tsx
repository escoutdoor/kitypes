import { AuthGuard } from "@/provider/AuthGuard"
import { AdminGuard } from "@/provider/AdminGuard"
import { AdminSidebar } from "@/components/shared/admin/admin-sidebar"
import { AdminHeader } from "@/components/shared/admin/admin-header"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: {
        template: "%s | Kitypes Admin",
        default: "Kitypes Admin",
    }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <AdminGuard>
                <div className="min-h-screen bg-gray-50/50">
                    <AdminSidebar />
                    <div className="flex flex-col md:pl-64">
                        <AdminHeader />
                        <main className="flex-1 p-4 md:p-8">
                            {children}
                        </main>
                    </div>
                </div>
            </AdminGuard>
        </AuthGuard>
    )
}
