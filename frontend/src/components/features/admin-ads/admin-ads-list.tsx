"use client"

import { useState } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Search, Inbox, CheckCircle2, Ban, Lock, PawPrint, X } from "lucide-react"

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

import { useAdminAds } from "@/hook/useAdminAds"
import { useDebounce } from "@/hook/useDebounce"
import { AD_STATUS, Ad } from "@/service/ad/ad.interface"
import { cn } from "@/lib/utils"
import { AdReviewSheet } from "./ad-review-sheet"

const LIMIT = 15

const STATUS_TABS = [
    { label: "Всі", value: "all", icon: Inbox },
    { label: "Відкриті", value: String(AD_STATUS.OPENED), icon: CheckCircle2 },
    { label: "Закриті", value: String(AD_STATUS.CLOSED), icon: Lock },
    { label: "Заблоковані", value: String(AD_STATUS.BLOCKED), icon: Ban },
] as const

const STATUS_LABELS: Record<number, string> = {
    [AD_STATUS.OPENED]: "Відкрите",
    [AD_STATUS.CLOSED]: "Закрите",
    [AD_STATUS.BLOCKED]: "Заблоковане",
}

export function AdminAdsList() {
    const router = useRouter()
    const pathname = usePathname()
    const sp = useSearchParams()

    const page = Number(sp.get("page")) || 1
    const statusQuery = sp.get("status") || "all"
    const petTypeQuery = sp.get("petType") || "all"
    const searchQuery = sp.get("search") || ""
    const authorIdQuery = sp.get("authorId") || undefined

    const debouncedSearchQuery = useDebounce(searchQuery, 500)

    const [selectedAdId, setSelectedAdId] = useState<string | null>(null)
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

    const { data, isLoading } = useAdminAds({
        limit: LIMIT,
        offset: (page - 1) * LIMIT,
        status: statusQuery === "all" ? undefined : Number(statusQuery),
        petType: petTypeQuery === "all" ? undefined : Number(petTypeQuery),
        search: debouncedSearchQuery.trim() || undefined,
        authorId: authorIdQuery,
    })

    const ads = data?.advertisements || []
    const total = data?.total || 0
    const totalPages = Math.max(1, Math.ceil(total / LIMIT))

    const handleRowClick = (ad: Ad) => {
        setSelectedAdId(ad.id)
        setIsSheetOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <Tabs
                    value={statusQuery}
                    onValueChange={(v) => updateQueryParams({ status: v === "all" ? null : v })}
                    className="w-full sm:w-auto overflow-x-auto"
                >
                    <TabsList className="bg-white border border-gray-200 shadow-sm h-11 p-1">
                        {STATUS_TABS.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="flex items-center gap-2 px-4 rounded-md data-[state=active]:bg-primary data-[state=active]:text-white transition-all cursor-pointer whitespace-nowrap"
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </TabsTrigger>
                            )
                        })}
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Select
                        value={petTypeQuery}
                        onValueChange={(v) => updateQueryParams({ petType: v === "all" ? null : v })}
                    >
                        <SelectTrigger className="w-[140px] bg-white border-gray-200 shadow-sm h-11 cursor-pointer">
                            <SelectValue placeholder="Всі тварини" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="cursor-pointer">Всі тварини</SelectItem>
                            <SelectItem value="1" className="cursor-pointer">Собаки</SelectItem>
                            <SelectItem value="2" className="cursor-pointer">Коти</SelectItem>
                            <SelectItem value="3" className="cursor-pointer">Інші</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Пошук за назвою..."
                            value={searchQuery}
                            onChange={(e) => updateQueryParams({ search: e.target.value || null })}
                            className="pl-9 h-11 bg-white border-gray-200 focus-visible:ring-primary/20 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {authorIdQuery && (
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-100 w-fit">
                    <span className="text-sm font-medium">Фільтр по автору: <span className="font-mono text-xs bg-white px-1.5 py-0.5 rounded shadow-sm">{authorIdQuery}</span></span>
                    <button
                        onClick={() => updateQueryParams({ authorId: null })}
                        className="p-1 hover:bg-blue-100 rounded-full transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/80">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-bold text-gray-500 uppercase text-xs h-12 px-6 w-[350px]">Оголошення</TableHead>
                            <TableHead className="font-bold text-gray-500 uppercase text-xs h-12 px-6">ID Автора</TableHead>
                            <TableHead className="font-bold text-gray-500 uppercase text-xs h-12 px-6">Дата</TableHead>
                            <TableHead className="font-bold text-gray-500 uppercase text-xs h-12 px-6">Статус</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell className="px-6 py-4"><Skeleton className="h-10 w-48" /></TableCell>
                                    <TableCell className="px-6 py-4"><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell className="px-6 py-4"><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                </TableRow>
                            ))
                        ) : ads.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-gray-500 font-medium">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <PawPrint className="h-8 w-8 text-gray-300" />
                                        Оголошень не знайдено
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            ads.map((ad) => {
                                const hasImage = ad.imageUrls && ad.imageUrls.length > 0
                                return (
                                    <TableRow
                                        key={ad.id}
                                        className="cursor-pointer group hover:bg-gray-50/80 transition-colors"
                                        onClick={() => handleRowClick(ad)}
                                    >
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border border-gray-100 shadow-sm shrink-0 rounded-md">
                                                    <AvatarImage src={hasImage ? ad.imageUrls[0] : ""} className="object-cover" />
                                                    <AvatarFallback className="bg-primary/5 text-primary rounded-md">
                                                        <PawPrint className="w-4 h-4" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-semibold text-gray-900 line-clamp-1 max-w-[250px]" title={ad.title}>
                                                        {ad.title}
                                                    </div>
                                                    <div className="text-xs text-gray-500 font-mono mt-0.5" title={ad.id}>
                                                        {ad.id.split('-')[0]}...
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="text-sm font-medium font-mono text-gray-900" title={ad.authorId}>
                                                {ad.authorId.split('-')[0]}...
                                            </div>
                                            <div className="text-xs text-gray-500 uppercase">{ad.authorRole}</div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-600 whitespace-nowrap text-sm">
                                            {new Intl.DateTimeFormat("uk-UA", {
                                                day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                                            }).format(new Date(ad.createdAt))}
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider",
                                                ad.status === AD_STATUS.OPENED && "bg-emerald-100 text-emerald-700",
                                                ad.status === AD_STATUS.CLOSED && "bg-gray-100 text-gray-600",
                                                ad.status === AD_STATUS.BLOCKED && "bg-red-100 text-red-700"
                                            )}>
                                                {STATUS_LABELS[ad.status] || ad.status}
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

            <AdReviewSheet
                adId={selectedAdId}
                isOpen={isSheetOpen}
                onOpenChangeAction={setIsSheetOpen}
            />
        </div>
    )
}
