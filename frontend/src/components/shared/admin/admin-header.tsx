"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, ShieldCheck, ArrowLeft, Flag, PawPrint, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { useProfile } from "@/hook/useProfile"
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
    {
        href: "/admin/ads",
        label: "Оголошення",
        icon: PawPrint,
    },
    {
        href: "/admin/users",
        label: "Користувачі",
        icon: Users,
    },
]

export function AdminHeader() {
    const pathname = usePathname()
    const { user } = useProfile()

    const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : "A"

    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b bg-white px-4 md:px-6">
            <div className="flex items-center gap-4 md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Відкрити меню</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                        <SheetTitle className="sr-only">Меню адміністратора</SheetTitle>
                        <div className="flex h-16 shrink-0 items-center border-b px-6">
                            <span className="flex items-center gap-2 font-bold text-xl text-gray-900">
                                <ShieldCheck className="h-6 w-6 text-primary" />
                                <span>Kitypes Admin</span>
                            </span>
                        </div>
                        <div className="flex flex-1 flex-col justify-between p-4 h-[calc(100vh-4rem)]">
                            <nav className="grid gap-1">
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
                                    На сайт
                                </Link>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-bold text-gray-900">{user?.firstName} {user?.lastName}</span>
                    <span className="text-xs text-primary font-medium">Адміністратор</span>
                </div>
                <Avatar className="h-9 w-9 border border-gray-100 shadow-sm">
                    <AvatarImage src={user?.avatarUrl || undefined} alt={user?.firstName} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
                </Avatar>
            </div>
        </header>
    )
}
