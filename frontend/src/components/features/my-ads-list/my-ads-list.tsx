"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PawPrint, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { PaginationBar } from "@/components/shared/pagination-bar/pagination-bar"

import { useMyAds } from "@/hook/useMyAds"
import { MyAdCard } from "./my-ad-card"

const LIMIT = 10

export function MyAdsList() {
    const [page, setPage] = useState(1)
    const [sortBy, setSortBy] = useState<"dateDesc" | "dateAsc">("dateDesc")
    const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined) // undefined = всі, 1 = активні, 2 = архів

    const { data, isLoading } = useMyAds({
        limit: LIMIT,
        offset: (page - 1) * LIMIT,
        sortBy,
        status: statusFilter,
    })

    const ads = data?.advertisements || []
    const total = data?.total || 0
    const totalPages = Math.max(1, Math.ceil(total / LIMIT))

    useEffect(() => {
        if (!isLoading && ads.length === 0 && page > 1) {
            setPage((p) => p - 1)
        }
    }, [ads.length, isLoading, page])

    const handleSortChange = (value: "dateDesc" | "dateAsc") => {
        setSortBy(value)
        setPage(1)
    }

    const handleStatusChange = (status: number | undefined) => {
        setStatusFilter(status)
        setPage(1)
    }

    const isCompletelyEmpty = !isLoading && total === 0 && statusFilter === undefined

    return (
        <div className="max-w-4xl mx-auto pt-8 pb-32 md:pb-48 px-4 md:px-0 min-h-[85vh] flex flex-col">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Мої оголошення</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Керуйте своїми публікаціями {!isCompletelyEmpty && `(${total})`}</p>
                </div>

                {!isCompletelyEmpty && (
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <Select value={sortBy} onValueChange={handleSortChange}>
                            <SelectTrigger className="w-full sm:w-[180px] bg-white cursor-pointer h-11 rounded-xl shadow-sm">
                                <SelectValue placeholder="Сортування" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="dateDesc" className="cursor-pointer">Спочатку нові</SelectItem>
                                <SelectItem value="dateAsc" className="cursor-pointer">Спочатку старі</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button asChild size="lg" className="w-full sm:w-auto gap-2 shadow-sm rounded-xl px-6 cursor-pointer">
                            <Link href="/ads/create">
                                <Plus className="h-5 w-5" /> Додати
                            </Link>
                        </Button>
                    </div>
                )}
            </div>

            {!isCompletelyEmpty && (
                <div className="inline-flex self-start bg-gray-100/80 p-1 rounded-xl mb-6 max-w-full overflow-x-auto border border-gray-200/60 custom-scrollbar">
                    <button
                        onClick={() => handleStatusChange(undefined)}
                        className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${statusFilter === undefined
                            ? "bg-white shadow-sm text-gray-900"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                            }`}
                    >
                        Всі
                    </button>
                    <button
                        onClick={() => handleStatusChange(1)}
                        className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${statusFilter === 1
                            ? "bg-white shadow-sm text-green-600"
                            : "text-gray-500 hover:text-green-600 hover:bg-gray-200/50"
                            }`}
                    >
                        Активні
                    </button>
                    <button
                        onClick={() => handleStatusChange(2)}
                        className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${statusFilter === 2
                            ? "bg-white shadow-sm text-gray-900"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                            }`}
                    >
                        В архіві
                    </button>
                </div>
            )}

            <div className="flex-1 space-y-5">
                {isLoading ? (
                    <div className="space-y-5">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
                        ))}
                    </div>
                ) : isCompletelyEmpty ? (
                    <div className="text-center py-24 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="p-4 bg-primary/10 rounded-full inline-block mb-4">
                            <PawPrint className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">У вас ще немає оголошень</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                            Ви ще не додали жодної тваринки. Створіть своє перше оголошення прямо зараз.
                        </p>
                        <Button asChild variant="outline" className="cursor-pointer bg-white">
                            <Link href="/ads/create">Створити оголошення</Link>
                        </Button>
                    </div>
                ) : ads.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50/50 rounded-3xl border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">Нічого не знайдено</h3>
                        <p className="text-muted-foreground text-sm">У цій категорії немає оголошень.</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {ads.map((ad) => (
                            <MyAdCard key={ad.id} ad={ad} />
                        ))}
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="mt-10">
                    <PaginationBar page={page} totalPages={totalPages} onPageChangeAction={setPage} />
                </div>
            )}
        </div>
    )
}
