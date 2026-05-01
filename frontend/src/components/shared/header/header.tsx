"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Menu, MessageSquare, PawPrint, Search, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from "@/components/ui/sheet"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { useAuthStore } from "@/store/auth.store"
import { useProfile } from "@/hook/useProfile"
import { useConversations } from "@/hook/useConversations"

const Header = () => {
    const pathname = usePathname()
    const router = useRouter()

    const { isAuthenticated, logout } = useAuthStore()
    const { user } = useProfile()
    const { data: convData } = useConversations()

    const conversations = convData?.pages.flatMap(p => p.conversations) || []

    // Рахуємо чи є хоча б одне непрочитане повідомлення від інших
    const unreadCount = conversations.filter(c =>
        c.lastMessage &&
        !c.lastMessage.isRead &&
        c.lastMessage.senderId !== user?.id
    ).length

    const routes = [
        {
            href: "/",
            label: "Головна",
            icon: Home,
            active: pathname === "/",
            show: true
        },
        {
            href: "/ads",
            label: "Оголошення",
            icon: Search,
            active: pathname === "/ads" || pathname.startsWith("/ads/"),
            show: true
        },
        {
            href: "/messages",
            label: "Чати",
            icon: MessageSquare,
            active: pathname.startsWith("/messages"),
            show: isAuthenticated
        },
    ].filter((route) => route.show)

    const handleLogout = async () => {
        await logout()
        router.push("/login")
    }

    const initials = user
        ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase()
        : "U"

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="mx-auto h-16 w-full max-w-7xl px-4 md:px-6">
                <div className="grid h-full grid-cols-[1fr_auto_1fr] items-center">

                    <div className="flex items-center justify-start">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl leading-none">
                            <PawPrint className="h-6 w-6" />
                            <span>Kitypes</span>
                        </Link>
                    </div>

                    <nav className="hidden md:flex items-center justify-center gap-10 text-sm font-medium leading-none">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={`relative flex items-center transition-all duration-200 hover:text-primary ${route.active ? "text-primary font-bold" : "text-muted-foreground font-semibold"
                                    }`}
                            >
                                <span className="relative pr-1.5">
                                    {route.label}

                                    {route.href === "/messages" && unreadCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
                                            <span
                                                className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-50"
                                                style={{ animationDuration: '5s' }}
                                            ></span>
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
                                        </span>
                                    )}
                                </span>
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center justify-end gap-4">
                        <div className="hidden md:block">
                            {isAuthenticated ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 transition-transform active:scale-95">
                                            <Avatar className="h-9 w-9 border border-gray-100 shadow-sm">
                                                <AvatarImage src={user?.avatarUrl || undefined} alt={user?.firstName || "User avatar"} className="object-cover" />
                                                <AvatarFallback className="bg-orange-50 text-orange-600 font-semibold">{initials}</AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent className="w-56" align="end" forceMount>
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-semibold leading-none text-gray-900">
                                                    {user?.firstName} {user?.lastName}
                                                </p>
                                                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                            </div>
                                        </DropdownMenuLabel>

                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem asChild className="cursor-pointer font-medium hover:text-orange-600">
                                            <Link href="/profile">Мій профіль</Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem asChild className="cursor-pointer font-medium hover:text-orange-600">
                                            <Link href="/my-ads">Мої оголошення</Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem asChild className="cursor-pointer font-medium hover:text-orange-600">
                                            <Link href="/favorites">Обрані</Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem asChild className="cursor-pointer font-medium hover:text-orange-600">
                                            <Link href="/profile/settings">Налаштування</Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem className="text-red-600 cursor-pointer font-medium focus:text-red-700 focus:bg-red-50" onClick={handleLogout}>
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Вийти</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Button asChild className="rounded-full px-6 shadow-sm hover:shadow-md transition-all bg-primary hover:bg-orange-600 text-white">
                                    <Link href="/login">Увійти</Link>
                                </Button>
                            )}
                        </div>

                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                                >
                                    <Menu className="h-6 w-6 text-gray-800" />
                                    <span className="sr-only">Відкрити меню</span>
                                </Button>
                            </SheetTrigger>

                            <SheetContent side="left" className="pr-0 pt-4 pl-4 flex flex-col h-full bg-white">
                                <SheetTitle className="sr-only">Навігація</SheetTitle>

                                <SheetClose asChild>
                                    <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-8">
                                        <PawPrint className="h-6 w-6 text-primary" />
                                        <span>Kitypes</span>
                                    </Link>
                                </SheetClose>

                                <nav className="flex flex-col gap-4 flex-1">
                                    {routes.map((route) => (
                                        <SheetClose asChild key={route.href}>
                                            <Link href={route.href} className={`flex items-center gap-3 text-lg font-medium transition-colors hover:text-primary ${route.active ? "text-primary" : "text-gray-700"}`}>
                                                <route.icon className="h-5 w-5" />
                                                <span className="relative pr-2">
                                                    {route.label}
                                                    {route.href === "/messages" && unreadCount > 0 && (
                                                        <span className="absolute top-0.5 -right-0 flex h-1.5 w-1.5">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-50" style={{ animationDuration: '3s' }}></span>
                                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                                                        </span>
                                                    )}
                                                </span>
                                            </Link>
                                        </SheetClose>
                                    ))}

                                    <hr className="my-4 border-gray-100 mr-4" />

                                    {isAuthenticated ? (
                                        <>
                                            <SheetClose asChild>
                                                <Link href="/profile" className="flex items-center gap-3 text-lg font-medium hover:text-primary mb-4 p-2 rounded-xl hover:bg-orange-50 mr-4 transition-colors">
                                                    <Avatar className="h-10 w-10 border border-orange-100 shadow-sm">
                                                        <AvatarImage src={user?.avatarUrl || undefined} alt={user?.firstName || "User avatar"} className="object-cover" />
                                                        <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">{initials}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="text-base font-bold text-gray-900">
                                                            {user?.firstName} {user?.lastName}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground font-normal">Перейти до профілю</span>
                                                    </div>
                                                </Link>
                                            </SheetClose>

                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 text-lg font-medium text-red-600 hover:text-red-700 mt-auto mb-8 text-left transition-colors mr-4 p-2 rounded-xl hover:bg-red-50"
                                            >
                                                <LogOut className="h-5 w-5" />
                                                Вийти з акаунта
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex flex-col gap-4 mt-auto mb-8 pr-4">
                                            <SheetClose asChild>
                                                <Button asChild className="w-full rounded-full shadow-sm bg-primary hover:bg-orange-600 text-white">
                                                    <Link href="/login">Увійти</Link>
                                                </Button>
                                            </SheetClose>
                                            <SheetClose asChild>
                                                <Button asChild variant="outline" className="w-full rounded-full border-gray-200 hover:bg-gray-50 text-gray-700">
                                                    <Link href="/register">Створити акаунт</Link>
                                                </Button>
                                            </SheetClose>
                                        </div>
                                    )}
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
