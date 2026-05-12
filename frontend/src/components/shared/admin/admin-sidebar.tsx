"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShieldCheck, ArrowLeft, Flag } from "lucide-react"

import { cn } from "@/lib/utils"

const ADMIN_ROUTES = [
    {
        href: "/admin/verifications",
        label: "Верифікації",
        icon: ShieldCheck,
    },
    {
        href: "/admin/reports",
        label: "Скарги",
        icon: Flag,
    },
]

export function AdminSidebar() {
    const pathname = usePathname()

    return (
        <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r bg-white md:flex">
            <div className="flex h-16 shrink-0 items-center border-b px-6">
                <Link href="/admin/verifications" className="flex items-center gap-2 font-bold text-xl text-gray-900">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    <span>Kitypes <span className="text-primary">Admin</span></span>
                </Link>
            </div>

            <div className="flex flex-1 flex-col justify-between p-4 overflow-y-auto custom-scrollbar">
                <nav className="grid gap-1">
                    <div className="px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Меню
                    </div>
                    {ADMIN_ROUTES.map((route) => {
                        const isActive = pathname.startsWith(route.href)
                        return (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                )}
                            >
                                <route.icon className="h-5 w-5" />
                                {route.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="mt-auto pt-4">
                    <Link
                        href="/"
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Повернутися на сайт
                    </Link>
                </div>
            </div>
        </aside>
    )
}
