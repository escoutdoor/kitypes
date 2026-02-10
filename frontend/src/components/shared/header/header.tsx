"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Menu, MessageSquare, PawPrint, Search, User } from "lucide-react"

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

const Header = () => {
	const pathname = usePathname()

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
		},
	]

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
							className={`transition-colors hover:text-primary ${
								route.active
									? "text-foreground"
									: "text-muted-foreground"
							}`}
						>
							{route.label}
						</Link>
					))}
				</nav>

				<div className="flex items-center gap-4">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className="relative h-8 w-8 rounded-full"
							>
								<Avatar className="h-8 w-8">
									<AvatarImage
										src="/avatars/01.png"
										alt="@ivan"
									/>
									<AvatarFallback>IV</AvatarFallback>
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
										Ivan Popov
									</p>
									<p className="text-xs leading-none text-muted-foreground">
										ivan@example.com
									</p>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild>
								<Link href="/profile">Мій профіль</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href="/profile/settings">
									Налаштування
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="text-red-600">
								Вийти
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

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
						<SheetContent side="left" className="pr-0 pt-4 pl-4">
							<SheetTitle className="sr-only">
								Навігація
							</SheetTitle>
							<Link
								href="/"
								className="flex items-center gap-2 font-bold text-xl mb-8"
							>
								<PawPrint className="h-6 w-6" />
								<span>Kitypes</span>
							</Link>
							<nav className="flex flex-col gap-4">
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
								<Link
									href="/profile"
									className="flex items-center gap-2 text-lg font-medium hover:text-primary"
								>
									<User className="h-5 w-5" />
									Профіль
								</Link>
							</nav>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	)
}

export default Header
