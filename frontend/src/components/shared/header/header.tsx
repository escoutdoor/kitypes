"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Menu, MessageSquare, PawPrint, Search, User, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet"
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

const Header = () => {
    const pathname = usePathname()
    const router = useRouter()


    const { isAuthenticated, logout } = useAuthStore()
    const { user } = useProfile()

    console.log("user: ", user)

    const routes = [
        {
            href: "/",
            label: "Головна",
            icon: Home,
            active: pathname === "/",
        },
        {
            href: "/ads",
            label: "Оголошення",
            icon: Search,
            active: pathname === "/ads",
        },
        {
            href: "/chat",
            label: "Чати",
            icon: MessageSquare,
            active: pathname === "/chat",
            // Можна приховати чати для неавторизованих:
            // show: isAuthenticated НУ ДАВАЙ
        },
    ]

    const handleLogout = async () => {
        await logout()
        router.push("/login")
    }

    // Генеруємо ініціали для аватарки (наприклад "IP" для Ivan Popov)
    const initials = user
        ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase()
        : "U"

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                <Link
                    href="/"
                    className="flex items-center gap-2 font-bold text-xl"
                >
                    <PawPrint className="h-6 w-6 text-primary" />
                    <span>Kitypes</span>
                </Link>

                <nav className="hidden md:flex items-center gap-10 text-sm font-medium">
                    {routes.map(route => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={`transition-colors hover:text-primary ${route.active
                                ? "text-foreground"
                                : "text-muted-foreground"
                                }`}
                        >
                            {route.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    {/* Десктопна авторизація */}
                    <div className="hidden md:block">
                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="relative h-8 w-8 rounded-full"
                                    >
                                        <Avatar className="h-8 w-8">
                                            {/* <AvatarImage src={user?.avatarUrl} alt={user?.firstName} /> */}
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-56"
                                    align="end"
                                    forceMount
                                >
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {user?.firstName} {user?.lastName}
                                            </p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user?.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild className="cursor-pointer">
                                        <Link href="/profile">Мій профіль</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="cursor-pointer">
                                        <Link href="/profile/settings">
                                            Налаштування
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-red-600 cursor-pointer"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Вийти</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button asChild variant="default">
                                <Link href="/login">Увійти</Link>
                            </Button>
                        )}
                    </div>

                    {/* Мобільне меню */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                            >
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Відкрити меню</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="pr-0 pt-4 pl-4 flex flex-col h-full">
                            <SheetTitle className="sr-only">
                                Навігація
                            </SheetTitle>
                            <Link
                                href="/"
                                className="flex items-center gap-2 font-bold text-xl mb-8"
                            >
                                <PawPrint className="h-6 w-6 text-primary" />
                                <span>Kitypes</span>
                            </Link>
                            <nav className="flex flex-col gap-4 flex-1">
                                {routes.map(route => (
                                    <Link
                                        key={route.href}
                                        href={route.href}
                                        className="flex items-center gap-2 text-lg font-medium hover:text-primary"
                                    >
                                        <route.icon className="h-5 w-5" />
                                        {route.label}
                                    </Link>
                                ))}

                                <hr className="my-4 border-gray-200 mr-4" />

                                {isAuthenticated ? (
                                    <>
                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-2 text-lg font-medium hover:text-primary"
                                        >
                                            <User className="h-5 w-5" />
                                            Мій профіль
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-2 text-lg font-medium text-red-600 hover:text-red-700 mt-auto mb-8 text-left"
                                        >
                                            <LogOut className="h-5 w-5" />
                                            Вийти з акаунта
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-4 mt-auto mb-8 pr-4">
                                        <Button asChild className="w-full">
                                            <Link href="/login">Увійти</Link>
                                        </Button>
                                        <Button asChild variant="outline" className="w-full">
                                            <Link href="/register">Створити акаунт</Link>
                                        </Button>
                                    </div>
                                )}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}

export default Header
