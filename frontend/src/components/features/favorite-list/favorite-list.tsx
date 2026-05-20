"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { HeartCrack, Search } from "lucide-react"

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

import { useFavorites } from "@/hook/useFavorites"
import { FavoriteCard } from "./favorite-card"

const LIMIT = 10

export function FavoritesList() {
    const [page, setPage] = useState(1)
    const [sortBy, setSortBy] = useState<"dateDesc" | "dateAsc">("dateDesc")

    const { data, isLoading } = useFavorites({
        limit: LIMIT,
        offset: (page - 1) * LIMIT,
        sortBy,
    })

    const favorites = data?.favorites || []
    const total = data?.total || 0
    const totalPages = Math.max(1, Math.ceil(total / LIMIT))

    useEffect(() => {
        if (!isLoading && favorites.length === 0 && page > 1) {
            setPage((p) => p - 1)
        }
    }, [favorites.length, isLoading, page])

    const handleSortChange = (value: "dateDesc" | "dateAsc") => {
        setSortBy(value)
        setPage(1)
    }

    const isCompletelyEmpty = !isLoading && total === 0

    return (
        <div className="max-w-4xl mx-auto pt-8 pb-32 md:pb-48 px-4 md:px-0 min-h-[85vh] flex flex-col">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Обрані</h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Збережені тваринки {!isCompletelyEmpty && `(${total})`}
                    </p>
                </div>

                {!isCompletelyEmpty && (
                    <div className="w-full sm:w-auto">
                        <Select value={sortBy} onValueChange={handleSortChange}>
                            <SelectTrigger className="w-full sm:w-[220px] bg-white cursor-pointer h-11 rounded-xl shadow-sm">
                                <SelectValue placeholder="Сортування" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="dateDesc" className="cursor-pointer">Останні додані</SelectItem>
                                <SelectItem value="dateAsc" className="cursor-pointer">Спочатку старі</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            <div className="flex-1 space-y-5">
                {isLoading ? (
                    <div className="space-y-5">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
                        ))}
                    </div>
                ) : isCompletelyEmpty ? (
                    <div className="text-center py-24 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="p-4 bg-red-50 rounded-full inline-block mb-4">
                            <HeartCrack className="h-10 w-10 text-red-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Ваш список порожній</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                            Ви ще не додали жодного оголошення в обране. Перегляньте каталог, щоб знайти друга.
                        </p>
                        <Button asChild className="cursor-pointer bg-white shadow-sm rounded-xl px-8" variant="outline">
                            <Link href="/ads">
                                <Search className="mr-2 h-4 w-4" /> Знайти тваринку
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {favorites.map((fav) => (
                            <FavoriteCard key={fav.id} favorite={fav} />
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
