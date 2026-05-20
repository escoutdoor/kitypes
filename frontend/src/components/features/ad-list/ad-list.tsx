"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { PawPrint } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAds } from "@/hook/useAds"
import { useDebounce } from "@/hook/useDebounce"

import { AdCard } from "./ad-card"
import { AdsSidebar } from "./ad-sidebar"
import { PaginationBar } from "@/components/shared/pagination-bar/pagination-bar"

const LIMIT = 12
type SortBy = "dateAsc" | "dateDesc"

function parseNum(v: string | null, fallback = 1) {
    const n = Number(v)
    return Number.isFinite(n) && n > 0 ? n : fallback
}

function parseOptionalNumber(v: string | null): number | undefined {
    if (!v) return undefined
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
}

export function AdList() {
    const router = useRouter()
    const sp = useSearchParams()

    const [search, setSearch] = useState(sp.get("search") ?? "")
    const [country, setCountry] = useState(sp.get("country") ?? "")
    const [city, setCity] = useState(sp.get("city") ?? "")
    const [petType, setPetType] = useState<number | undefined>(
        sp.get("petType") ? Number(sp.get("petType")) : undefined
    )
    const [petGender, setPetGender] = useState<number | undefined>(
        sp.get("petGender") ? Number(sp.get("petGender")) : undefined
    )
    const [minPetAgeMonth, setMinPetAgeMonth] = useState<number | undefined>(
        parseOptionalNumber(sp.get("minPetAgeMonth"))
    )
    const [maxPetAgeMonth, setMaxPetAgeMonth] = useState<number | undefined>(
        parseOptionalNumber(sp.get("maxPetAgeMonth"))
    )
    const [sortBy, setSortBy] = useState<SortBy>(
        sp.get("sortBy") === "dateAsc" ? "dateAsc" : "dateDesc"
    )
    const [verifiedOnly, setVerifiedOnly] = useState<boolean>(sp.get("verifiedOnly") === "true")
    const [page, setPage] = useState(parseNum(sp.get("page"), 1))

    const debouncedSearch = useDebounce(search, 500)
    const debouncedCountry = useDebounce(country, 500)
    const debouncedCity = useDebounce(city, 500)

    const query = useMemo(() => {
        const p = new URLSearchParams()
        if (debouncedSearch.trim()) p.set("search", debouncedSearch.trim())
        if (debouncedCountry.trim()) p.set("country", debouncedCountry.trim())
        if (debouncedCity.trim()) p.set("city", debouncedCity.trim())
        if (petType) p.set("petType", String(petType))
        if (petGender) p.set("petGender", String(petGender))
        if (typeof minPetAgeMonth === "number") p.set("minPetAgeMonth", String(minPetAgeMonth))
        if (typeof maxPetAgeMonth === "number") p.set("maxPetAgeMonth", String(maxPetAgeMonth))
        if (sortBy !== "dateDesc") p.set("sortBy", sortBy)
        if (verifiedOnly) p.set("verifiedOnly", "true")
        if (page > 1) p.set("page", String(page))
        return p.toString()
    }, [
        debouncedSearch,
        debouncedCountry,
        debouncedCity,
        petType,
        petGender,
        minPetAgeMonth,
        maxPetAgeMonth,
        sortBy,
        page,
    ])

    useEffect(() => {
        router.replace(query ? `/ads?${query}` : "/ads", { scroll: false })
    }, [query, router])

    const { data, isLoading, isFetching } = useAds({
        limit: LIMIT,
        offset: (page - 1) * LIMIT,
        search: debouncedSearch.trim() || undefined,
        country: debouncedCountry.trim() || undefined,
        city: debouncedCity.trim() || undefined,
        petType,
        petGender,
        minPetAgeMonth,
        maxPetAgeMonth,
        status: 1,
        sortBy,
        verifiedOnly: verifiedOnly || undefined,
    })

    const ads = data?.advertisements ?? []
    const total = data?.total ?? 0
    const totalPages = Math.max(1, Math.ceil(total / LIMIT))

    const clearFilters = () => {
        setSearch("")
        setCountry("")
        setCity("")
        setPetType(undefined)
        setPetGender(undefined)
        setMinPetAgeMonth(undefined)
        setMaxPetAgeMonth(undefined)
        setSortBy("dateDesc")
        setVerifiedOnly(false)
        setPage(1)
    }

    return (
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8 pb-28 md:pb-50 w-full min-h-[calc(100vh-220px)]">
            <div className="mb-8 bg-primary/5 rounded-3xl p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 border border-primary/10">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-2">
                        Знайдіть свого вірного друга
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-xl">
                        Сотні тваринок чекають на свою родину.
                    </p>
                </div>

                <Button asChild size="lg" className="rounded-full px-8 shadow-sm hover:shadow-md transition-all">
                    <Link href="/ads/create">Віддати в добрі руки</Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr] gap-8">
                <AdsSidebar
                    search={search}
                    country={country}
                    city={city}
                    petType={petType}
                    petGender={petGender}
                    minPetAgeMonth={minPetAgeMonth}
                    maxPetAgeMonth={maxPetAgeMonth}
                    sortBy={sortBy}
                    verifiedOnly={verifiedOnly}
                    onSearchChangeAction={(v) => { setSearch(v); setPage(1) }}
                    onCountryChangeAction={(v) => { setCountry(v); setPage(1) }}
                    onCityChangeAction={(v) => { setCity(v); setPage(1) }}
                    onPetTypeChangeAction={(v) => { setPetType(v); setPage(1) }}
                    onPetGenderChangeAction={(v) => { setPetGender(v); setPage(1) }}
                    onMinPetAgeChangeAction={(v) => { setMinPetAgeMonth(v); setPage(1) }}
                    onMaxPetAgeChangeAction={(v) => { setMaxPetAgeMonth(v); setPage(1) }}
                    onSortByChangeAction={(v) => { setSortBy(v); setPage(1) }}
                    onClearFiltersAction={clearFilters}
                    onVerifiedOnlyChangeAction={(v) => { setVerifiedOnly(v); setPage(1) }}
                />

                <main className="space-y-6 min-w-0 pb-16 md:pb-24">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{isLoading ? "Шукаємо..." : `Знайдено оголошень: ${total}`}</span>
                        {isFetching && !isLoading && <span className="text-primary animate-pulse">Оновлюємо...</span>}
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="space-y-3">
                                    <Skeleton className="h-64 w-full rounded-2xl" />
                                    <Skeleton className="h-5 w-3/4" />
                                </div>
                            ))}
                        </div>
                    ) : ads.length === 0 ? (
                        <div className="text-center py-24 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                            <PawPrint className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Нічого не знайдено</h3>
                            <Button onClick={clearFilters} variant="outline" className="mt-4">
                                Скинути фільтри
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {ads.map((ad) => (
                                <AdCard key={ad.id} ad={ad} />
                            ))}
                        </div>
                    )}

                    <PaginationBar page={page} totalPages={totalPages} onPageChangeAction={setPage} />
                </main>
            </div>
        </div>
    )
}
