"use client"

import { useState } from "react"
import { Clock, CheckCircle2, XCircle, Search, Inbox, LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { PaginationBar } from "@/components/shared/pagination-bar/pagination-bar"

import { useAdminVerifications } from "@/hook/useAdminVerifications"
import { AdminVerificationItem, VerificationStatus } from "@/service/admin-verification/admin-verification.interface"
import { VerificationReviewSheet } from "./verification-review-sheet"
import { useDebounce } from "@/hook/useDebounce"
import { cn } from "@/lib/utils"

const LIMIT = 15

type FilterStatus = VerificationStatus | "all"

const STATUS_TABS: { label: string; value: FilterStatus; icon: LucideIcon }[] = [
    { label: "В обробці", value: "pending", icon: Clock },
    { label: "Схвалені", value: "approved", icon: CheckCircle2 },
    { label: "Відхилені", value: "rejected", icon: XCircle },
    { label: "Всі", value: "all", icon: Inbox },
]

export function AdminVerificationList() {
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState<FilterStatus>("pending")
    const [searchQuery, setSearchQuery] = useState("")
    const debouncedSearchQuery = useDebounce(searchQuery, 500)

    const [selectedRequest, setSelectedRequest] = useState<AdminVerificationItem | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    const { data, isLoading } = useAdminVerifications({
        limit: LIMIT,
        offset: (page - 1) * LIMIT,
        status: statusFilter === "all" ? undefined : statusFilter,
        query: debouncedSearchQuery.trim() || undefined,
    })

    const requests = data?.requests || []
    const total = data?.total || 0
    const totalPages = Math.max(1, Math.ceil(total / LIMIT))

    const handleRowClick = (req: AdminVerificationItem) => {
        setSelectedRequest(req)
        setIsSheetOpen(true)
    }

    const handleStatusChange = (value: string) => {
        setStatusFilter(value as FilterStatus)
        setPage(1)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <Tabs value={statusFilter} onValueChange={handleStatusChange} className="w-full sm:w-auto">
                    <TabsList className="bg-white border border-gray-200 shadow-sm h-11 p-1">
                        {STATUS_TABS.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="flex items-center gap-2 px-4 rounded-md data-[state=active]:bg-primary data-[state=active]:text-white transition-all cursor-pointer"
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </TabsTrigger>
                            )
                        })}
                    </TabsList>
                </Tabs>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Пошук за email або ім'ям..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setPage(1)
                        }}
                        className="pl-9 h-11 bg-white border-gray-200 focus-visible:ring-primary/20 shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/80">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-bold text-gray-500 uppercase text-xs h-12 px-6">Користувач</TableHead>
                            <TableHead className="font-bold text-gray-500 uppercase text-xs h-12 px-6">Роль</TableHead>
                            <TableHead className="font-bold text-gray-500 uppercase text-xs h-12 px-6">Дата подачі</TableHead>
                            <TableHead className="font-bold text-gray-500 uppercase text-xs h-12 px-6">Статус</TableHead>
                            <TableHead className="font-bold text-gray-500 uppercase text-xs h-12 px-6 text-right">Дії</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell className="px-6 py-4"><Skeleton className="h-10 w-40" /></TableCell>
                                    <TableCell className="px-6 py-4"><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell className="px-6 py-4"><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                    <TableCell className="px-6 py-4"><Skeleton className="h-8 w-20 ml-auto rounded-lg" /></TableCell>
                                </TableRow>
                            ))
                        ) : requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-gray-500 font-medium">
                                    Заявок не знайдено
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map((req) => {
                                const initials = `${req.user.firstName[0]}${req.user.lastName[0]}`.toUpperCase()
                                return (
                                    <TableRow
                                        key={req.id}
                                        className="cursor-pointer group hover:bg-gray-50/80 transition-colors"
                                        onClick={() => handleRowClick(req)}
                                    >
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border border-gray-100 shadow-sm shrink-0">
                                                    <AvatarImage src={req.user.avatarUrl} alt={req.user.firstName} className="object-cover" />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">{initials}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-semibold text-gray-900">
                                                        {req.user.firstName} {req.user.lastName}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5">{req.user.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <span className="font-medium text-gray-700 capitalize">
                                                {req.requestedRole}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-600 whitespace-nowrap">
                                            {new Intl.DateTimeFormat("uk-UA", {
                                                day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                                            }).format(new Date(req.createdAt))}
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider",
                                                req.status === "pending" && "bg-amber-100 text-amber-700",
                                                req.status === "approved" && "bg-emerald-100 text-emerald-700",
                                                req.status === "rejected" && "bg-red-100 text-red-700"
                                            )}>
                                                {req.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="sm" className="font-semibold text-primary hover:text-primary hover:bg-primary/10">
                                                Переглянути
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>

                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                        <PaginationBar page={page} totalPages={totalPages} onPageChangeAction={setPage} />
                    </div>
                )}
            </div>

            <VerificationReviewSheet
                request={selectedRequest}
                isOpen={isSheetOpen}
                onOpenChangeAction={setIsSheetOpen}
            />
        </div>
    )
}
