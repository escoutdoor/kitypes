"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Search, UserX, UserCheck, Inbox, Users as UsersIcon } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { PaginationBar } from "@/components/shared/pagination-bar/pagination-bar"

import { useAdminUsers } from "@/hook/useAdminUsers"
import { useDebounce } from "@/hook/useDebounce"
import { UserRole, User } from "@/service/user/user.interface"
import { cn } from "@/lib/utils"
import { UserReviewSheet } from "./user-review-sheet"

const LIMIT = 15

const ROLE_LABELS: Record<string, string> = {
    user: "Користувач",
    volunteer: "Волонтер",
    shelter: "Притулок",
    admin: "Адміністратор",
}

export function AdminUsersList() {
    const router = useRouter()
    const pathname = usePathname()
    const sp = useSearchParams()

    const page = Number(sp.get("page")) || 1
    const statusQuery = sp.get("status") || "all"
    const roleQuery = sp.get("role") || "all"
    const searchQuery = sp.get("search") || ""

    const [localSearch, setLocalSearch] = useState(searchQuery)
    const debouncedSearch = useDebounce(localSearch, 500)

    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    const updateQueryParams = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(sp.toString())

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null) {
                params.delete(key)
            } else {
                params.set(key, value)
            }
        })

        if (!updates.page) {
            params.delete("page")
        }

        router.push(`${pathname}?${params.toString()}`)
    }

    useEffect(() => {
        if (debouncedSearch !== searchQuery) {
            updateQueryParams({ search: debouncedSearch || null, page: null })
        }
    }, [debouncedSearch])

    const { data, isLoading } = useAdminUsers({
        limit: LIMIT,
        offset: (page - 1) * LIMIT,
        search: searchQuery.trim() || undefined,
        role: roleQuery === "all" ? undefined : (roleQuery as UserRole),
        isBanned: statusQuery === "banned" ? true : statusQuery === "active" ? false : undefined,
    })

    const users = data?.users || []
    const total = data?.total || 0
    const totalPages = Math.max(1, Math.ceil(total / LIMIT))

    // Динамічно знаходимо актуального користувача з масиву (гарантує оновлення інтерфейсу)
    const selectedUser = users.find((u) => u.id === selectedUserId) || null

    const handleRowClick = (user: User) => {
        setSelectedUserId(user.id)
        setIsSheetOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <Tabs
                    value={statusQuery}
                    onValueChange={(v) => updateQueryParams({ status: v === "all" ? null : v })}
                    className="w-full sm:w-auto"
                >
                    <TabsList className="bg-white border border-gray-200 shadow-sm h-11 p-1">
                        <TabsTrigger value="all" className="flex items-center gap-2 px-4 rounded-md data-[state=active]:bg-primary data-[state=active]:text-white transition-all cursor-pointer">
                            <Inbox className="w-4 h-4" /> Всі
                        </TabsTrigger>
                        <TabsTrigger value="active" className="flex items-center gap-2 px-4 rounded-md data-[state=active]:bg-primary data-[state=active]:text-white transition-all cursor-pointer">
                            <UserCheck className="w-4 h-4" /> Активні
                        </TabsTrigger>
                        <TabsTrigger value="banned" className="flex items-center gap-2 px-4 rounded-md data-[state=active]:bg-primary data-[state=active]:text-white transition-all cursor-pointer">
                            <UserX className="w-4 h-4" /> Заблоковані
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Select
                        value={roleQuery}
                        onValueChange={(v) => updateQueryParams({ role: v === "all" ? null : v })}
                    >
                        <SelectTrigger className="w-[160px] bg-white border-gray-200 shadow-sm h-11 cursor-pointer">
                            <SelectValue placeholder="Всі ролі" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="cursor-pointer">Всі ролі</SelectItem>
                            <SelectItem value="user" className="cursor-pointer">Користувачі</SelectItem>
                            <SelectItem value="volunteer" className="cursor-pointer">Волонтери</SelectItem>
                            <SelectItem value="shelter" className="cursor-pointer">Притулки</SelectItem>
                            <SelectItem value="admin" className="cursor-pointer">Адміністратори</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Пошук за ім'ям, email..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            className="pl-9 h-11 bg-white border-gray-200 focus-visible:ring-primary/20 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/80">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-bold text-gray-500 uppercase text-xs h-12 px-6">Користувач</TableHead>
                            <TableHead className="font-bold text-gray-500 uppercase text-xs h-12 px-6">Роль</TableHead>
                            <TableHead className="font-bold text-gray-500 uppercase text-xs h-12 px-6">Реєстрація</TableHead>
                            <TableHead className="font-bold text-gray-500 uppercase text-xs h-12 px-6 text-right">Статус</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell className="px-6 py-4"><Skeleton className="h-10 w-48" /></TableCell>
                                    <TableCell className="px-6 py-4"><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell className="px-6 py-4"><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell className="px-6 py-4"><Skeleton className="h-6 w-20 ml-auto rounded-full" /></TableCell>
                                </TableRow>
                            ))
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-gray-500 font-medium">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <UsersIcon className="h-8 w-8 text-gray-300" />
                                        Користувачів не знайдено
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((u) => {
                                const initials = `${u.firstName[0]}${u.lastName[0]}`.toUpperCase()
                                return (
                                    <TableRow
                                        key={u.id}
                                        className="cursor-pointer group hover:bg-gray-50/80 transition-colors"
                                        onClick={() => handleRowClick(u)}
                                    >
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border border-gray-100 shadow-sm shrink-0">
                                                    <AvatarImage src={u.avatarUrl || ""} className="object-cover" />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">{initials}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-semibold text-gray-900">
                                                        {u.firstName} {u.lastName}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5">{u.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <span className="font-medium text-gray-700 capitalize">
                                                {ROLE_LABELS[u.role] || u.role}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-600 whitespace-nowrap text-sm">
                                            {new Intl.DateTimeFormat("uk-UA", {
                                                day: "numeric", month: "short", year: "numeric"
                                            }).format(new Date(u.createdAt))}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-right">
                                            <span className={cn(
                                                "inline-block px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider",
                                                !u.isBanned ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                            )}>
                                                {!u.isBanned ? "Активний" : "Заблокований"}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>

                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                        <PaginationBar
                            page={page}
                            totalPages={totalPages}
                            onPageChangeAction={(newPage) => updateQueryParams({ page: String(newPage) })}
                        />
                    </div>
                )}
            </div>

            <UserReviewSheet
                user={selectedUser}
                isOpen={isSheetOpen}
                onOpenChangeAction={setIsSheetOpen}
            />
        </div>
    )
}
