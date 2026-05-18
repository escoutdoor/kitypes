"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Menu, MessageSquare, PawPrint, Search, LogOut, ShieldCheck, Heart, LayoutList, User as UserIcon, Eye, Lock, LifeBuoy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from "@/components/ui/sheet"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
                <div className="flex h-full items-center justify-between">

                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl leading-none">
                            <PawPrint className="h-6 w-6 text-primary" />
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
                                                className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/80 opacity-50"
                                                style={{ animationDuration: '5s' }}
                                            ></span>
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                                        </span>
                                    )}
                                </span>
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:block">
                            {isAuthenticated ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 transition-transform active:scale-95">
                                            <Avatar className="h-9 w-9 border border-gray-100 shadow-sm">
                                                <AvatarImage src={user?.avatarUrl || undefined} alt={user?.firstName || "User avatar"} className="object-cover" />
                                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent className="w-60 p-1.5" align="end" forceMount>

                                        <div className="flex items-center gap-2.5 px-2.5 py-2.5 mb-1">
                                            <Avatar className="h-9 w-9 shrink-0 border border-gray-100">
                                                <AvatarImage src={user?.avatarUrl || undefined} className="object-cover" />
                                                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">{initials}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
                                                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                            </div>
                                        </div>

                                        <DropdownMenuSeparator />

                                        {user?.role === "admin" && (
                                            <>
                                                <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-0 focus:bg-transparent">
                                                    <Link href="/admin/verifications" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                                                        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 shrink-0">
                                                            <ShieldCheck className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <span className="text-sm font-semibold text-primary">Адмін-панель</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                            </>
                                        )}

                                        <DropdownMenuItem asChild className="cursor-pointer rounded-lg focus:bg-gray-100/80">
                                            <Link href={`/users/${user?.id}`} className="flex items-center gap-2.5 px-2.5 py-1.5">
                                                <Eye className="h-4 w-4 text-gray-400 shrink-0" />
                                                <span className="text-sm text-gray-800">Мій профіль</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild className="cursor-pointer rounded-lg focus:bg-gray-100/80">
                                            <Link href="/my-ads" className="flex items-center gap-2.5 px-2.5 py-1.5">
                                                <LayoutList className="h-4 w-4 text-gray-400 shrink-0" />
                                                <span className="text-sm text-gray-800">Мої оголошення</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild className="cursor-pointer rounded-lg focus:bg-gray-100/80">
                                            <Link href="/favorites" className="flex items-center gap-2.5 px-2.5 py-1.5">
                                                <Heart className="h-4 w-4 text-gray-400 shrink-0" />
                                                <span className="text-sm text-gray-800">Обрані</span>
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem asChild className="cursor-pointer rounded-lg focus:bg-gray-100/80">
                                            <Link href="/contacts" className="flex items-center gap-2.5 px-2.5 py-1.5">
                                                <LifeBuoy className="h-4 w-4 text-gray-400 shrink-0" />
                                                <span className="text-sm text-gray-800">Підтримка</span>
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem asChild className="cursor-pointer rounded-lg focus:bg-gray-100/80">
                                            <Link href="/profile" className="flex items-center gap-2.5 px-2.5 py-1.5">
                                                <UserIcon className="h-4 w-4 text-gray-400 shrink-0" />
                                                <span className="text-sm text-gray-800">Особисті дані</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild className="cursor-pointer rounded-lg focus:bg-gray-100/80">
                                            <Link href="/profile/settings" className="flex items-center gap-2.5 px-2.5 py-1.5">
                                                <Lock className="h-4 w-4 text-gray-400 shrink-0" />
                                                <span className="text-sm text-gray-800">Пароль та безпека</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild className="cursor-pointer rounded-lg focus:bg-gray-100/80">
                                            <Link href="/profile/verification" className="flex items-center justify-between gap-2.5 px-2.5 py-1.5">
                                                <div className="flex items-center gap-2.5">
                                                    <ShieldCheck className="h-4 w-4 text-gray-400 shrink-0" />
                                                    <span className="text-sm text-gray-800">Верифікація</span>
                                                </div>
                                                {user?.role === "user" && (
                                                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                                )}
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem
                                            className="cursor-pointer rounded-lg text-red-600 focus:text-red-700 focus:bg-red-50 gap-2.5 px-2.5 py-1.5"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="h-4 w-4 shrink-0" />
                                            <span className="text-sm">Вийти з акаунта</span>
                                        </DropdownMenuItem>

                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Button asChild className="rounded-full px-6 shadow-sm hover:shadow-md transition-all bg-primary hover:bg-primary/90 text-white cursor-pointer">
                                    <Link href="/login">Увійти</Link>
                                </Button>
                            )}
                        </div>

                        {/* MOBILE MENU */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden cursor-pointer"
                                >
                                    <Menu className="h-6 w-6 text-gray-800" />
                                    <span className="sr-only">Відкрити меню</span>
                                </Button>
                            </SheetTrigger>

                            <SheetContent side="left" className="w-[300px] sm:w-[350px] pr-0 pt-4 pl-4 flex flex-col h-full bg-white overflow-y-auto custom-scrollbar">
                                <SheetTitle className="sr-only">Навігація</SheetTitle>

                                <SheetClose asChild>
                                    <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-8 cursor-pointer">
                                        <PawPrint className="h-6 w-6 text-primary" />
                                        <span>Kitypes</span>
                                    </Link>
                                </SheetClose>

                                <nav className="flex flex-col gap-2 flex-1">
                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Навігація</div>
                                    {routes.map((route) => (
                                        <SheetClose asChild key={route.href}>
                                            <Link
                                                href={route.href}
                                                className={`flex items-center gap-3 text-base font-medium transition-all duration-200 p-2 rounded-xl mr-4 cursor-pointer active:scale-[0.98] ${route.active ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-100 hover:text-primary active:bg-gray-200"}`}
                                            >
                                                <route.icon className="h-5 w-5" />
                                                <span className="relative">
                                                    {route.label}
                                                    {route.href === "/messages" && unreadCount > 0 && (
                                                        <span className="absolute top-1 -right-3 flex h-2 w-2 rounded-full bg-primary"></span>
                                                    )}
                                                </span>
                                            </Link>
                                        </SheetClose>
                                    ))}

                                    <SheetClose asChild>
                                        <Link
                                            href="/contacts"
                                            className={`flex items-center gap-3 text-base font-medium transition-all duration-200 p-2 rounded-xl mr-4 cursor-pointer active:scale-[0.98] ${pathname === "/contacts" ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-100 hover:text-primary active:bg-gray-200"}`}
                                        >
                                            <LifeBuoy className="h-5 w-5" />
                                            <span className="relative">Підтримка</span>
                                        </Link>
                                    </SheetClose>

                                    <hr className="my-4 border-gray-100 mr-4" />

                                    {isAuthenticated ? (
                                        <>
                                            {user?.role === "admin" && (
                                                <>
                                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2">Управління</div>
                                                    <SheetClose asChild>
                                                        <Link
                                                            href="/admin/verifications"
                                                            className="flex items-center gap-3 text-base font-medium transition-all duration-200 p-2 rounded-xl mr-4 text-gray-900 hover:bg-gray-100 cursor-pointer active:scale-[0.98]"
                                                        >
                                                            <div className="flex items-center justify-center bg-primary/10 rounded-md p-1.5">
                                                                <ShieldCheck className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <span className="font-semibold">Адмін-панель</span>
                                                        </Link>
                                                    </SheetClose>
                                                    <hr className="my-4 border-gray-100 mr-4" />
                                                </>
                                            )}

                                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Мій акаунт</div>

                                            <SheetClose asChild>
                                                <Link href={`/users/${user?.id}`} className="flex items-center gap-3 text-base font-medium transition-all duration-200 p-2 rounded-xl mr-4 text-gray-700 hover:bg-gray-100 hover:text-primary cursor-pointer active:scale-[0.98] active:bg-gray-200">
                                                    <Eye className="h-5 w-5" />
                                                    Мій публічний профіль
                                                </Link>
                                            </SheetClose>

                                            <SheetClose asChild>
                                                <Link href="/my-ads" className="flex items-center gap-3 text-base font-medium transition-all duration-200 p-2 rounded-xl mr-4 text-gray-700 hover:bg-gray-100 hover:text-primary cursor-pointer active:scale-[0.98] active:bg-gray-200">
                                                    <LayoutList className="h-5 w-5" />
                                                    Мої оголошення
                                                </Link>
                                            </SheetClose>

                                            <SheetClose asChild>
                                                <Link href="/favorites" className="flex items-center gap-3 text-base font-medium transition-all duration-200 p-2 rounded-xl mr-4 text-gray-700 hover:bg-gray-100 hover:text-primary cursor-pointer active:scale-[0.98] active:bg-gray-200">
                                                    <Heart className="h-5 w-5" />
                                                    Обрані
                                                </Link>
                                            </SheetClose>

                                            <hr className="my-4 border-gray-100 mr-4" />
                                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Налаштування</div>

                                            <SheetClose asChild>
                                                <Link href="/profile" className="flex items-center gap-3 text-base font-medium transition-all duration-200 p-2 rounded-xl mr-4 text-gray-700 hover:bg-gray-100 hover:text-primary cursor-pointer active:scale-[0.98] active:bg-gray-200">
                                                    <UserIcon className="h-5 w-5" />
                                                    Особисті дані
                                                </Link>
                                            </SheetClose>

                                            <SheetClose asChild>
                                                <Link href="/profile/settings" className="flex items-center gap-3 text-base font-medium transition-all duration-200 p-2 rounded-xl mr-4 text-gray-700 hover:bg-gray-100 hover:text-primary cursor-pointer active:scale-[0.98] active:bg-gray-200">
                                                    <Lock className="h-5 w-5" />
                                                    Безпека
                                                </Link>
                                            </SheetClose>

                                            <SheetClose asChild>
                                                <Link href="/profile/verification" className="flex items-center gap-3 text-base font-medium transition-all duration-200 p-2 rounded-xl mr-4 text-gray-700 hover:bg-gray-100 hover:text-primary cursor-pointer active:scale-[0.98] active:bg-gray-200">
                                                    <ShieldCheck className="h-5 w-5" />
                                                    <span className="relative">
                                                        Верифікація
                                                        {user?.role === "user" && (
                                                            <span className="absolute top-1 -right-3 flex h-2 w-2 rounded-full bg-blue-500"></span>
                                                        )}
                                                    </span>
                                                </Link>
                                            </SheetClose>

                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 text-base font-medium text-red-600 hover:text-red-700 mt-auto mb-8 text-left transition-all duration-200 mr-4 p-2 rounded-xl hover:bg-red-50 cursor-pointer active:scale-[0.98] active:bg-red-100"
                                            >
                                                <LogOut className="h-5 w-5" />
                                                Вийти з акаунта
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex flex-col gap-4 mt-auto mb-8 pr-4">
                                            <SheetClose asChild>
                                                <Button asChild className="w-full rounded-full shadow-sm bg-primary hover:bg-primary/90 text-white cursor-pointer active:scale-[0.98]">
                                                    <Link href="/login">Увійти</Link>
                                                </Button>
                                            </SheetClose>
                                            <SheetClose asChild>
                                                <Button asChild variant="outline" className="w-full rounded-full border-gray-200 hover:bg-gray-50 text-gray-700 cursor-pointer active:scale-[0.98]">
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
