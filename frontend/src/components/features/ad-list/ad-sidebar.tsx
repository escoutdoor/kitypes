"use client"

import { Search, MapPin, Dog, Cat, Rabbit, Mars, Venus, FilterX, Globe2, CalendarDays, ArrowUpDown, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type SortBy = "dateAsc" | "dateDesc"

type Props = {
    search: string
    country: string
    city: string
    petType?: number
    petGender?: number
    minPetAgeMonth?: number
    maxPetAgeMonth?: number
    sortBy: SortBy
    verifiedOnly: boolean
    onSearchChangeAction: (v: string) => void
    onCountryChangeAction: (v: string) => void
    onCityChangeAction: (v: string) => void
    onPetTypeChangeAction: (v: number | undefined) => void
    onPetGenderChangeAction: (v: number | undefined) => void
    onMinPetAgeChangeAction: (v: number | undefined) => void
    onMaxPetAgeChangeAction: (v: number | undefined) => void
    onSortByChangeAction: (v: SortBy) => void
    onClearFiltersAction: () => void
    onVerifiedOnlyChangeAction: (v: boolean) => void
}

export function AdsSidebar(props: Props) {
    const hasFilters = !!(
        props.search ||
        props.country ||
        props.city ||
        props.petType ||
        props.petGender ||
        typeof props.minPetAgeMonth === "number" ||
        typeof props.maxPetAgeMonth === "number" ||
        props.sortBy !== "dateDesc"
    )

    return (
        <aside className="space-y-6">
            <Card className="border-none shadow-sm rounded-2xl sticky top-24">
                <CardContent className="p-6 space-y-8">
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-800">Пошук</label>
                        <div className="relative flex items-center">
                            <Search className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
                            <Input className="pl-9 bg-gray-50/50 w-full" value={props.search} onChange={(e) => props.onSearchChangeAction(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-800">Країна</label>
                        <div className="relative flex items-center">
                            <Globe2 className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
                            <Input className="pl-9 bg-gray-50/50 w-full" value={props.country} onChange={(e) => props.onCountryChangeAction(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-800">Місто</label>
                        <div className="relative flex items-center">
                            <MapPin className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
                            <Input className="pl-9 bg-gray-50/50 w-full" value={props.city} onChange={(e) => props.onCityChangeAction(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-800">Тип</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[{ v: 1, i: Dog }, { v: 2, i: Cat }, { v: 3, i: Rabbit }].map((t) => (
                                <button
                                    key={t.v}
                                    type="button"
                                    onClick={() => props.onPetTypeChangeAction(props.petType === t.v ? undefined : t.v)}
                                    className={`py-3 rounded-xl border flex justify-center transition-all duration-200 ${props.petType === t.v ? "border-primary bg-primary/10 text-primary" : "border-gray-200 text-gray-500 hover:border-primary/40 hover:bg-gray-50"
                                        }`}
                                >
                                    <t.i className="h-5 w-5" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-800">Стать</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => props.onPetGenderChangeAction(props.petGender === 1 ? undefined : 1)}
                                className={`py-2.5 rounded-xl border flex justify-center items-center gap-2 transition-all duration-200 ${props.petGender === 1 ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50"
                                    }`}
                            >
                                <Mars className="h-4 w-4" /> <span className="text-sm font-medium">Хлопчик</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => props.onPetGenderChangeAction(props.petGender === 2 ? undefined : 2)}
                                className={`py-2.5 rounded-xl border flex justify-center items-center gap-2 transition-all duration-200 ${props.petGender === 2 ? "border-pink-500 bg-pink-50 text-pink-700" : "border-gray-200 text-gray-600 hover:border-pink-300 hover:bg-pink-50"
                                    }`}
                            >
                                <Venus className="h-4 w-4" /> <span className="text-sm font-medium">Дівчинка</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            Вік (місяці)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                type="number"
                                min={0}
                                placeholder="Від"
                                value={props.minPetAgeMonth ?? ""}
                                onChange={(e) => props.onMinPetAgeChangeAction(e.target.value === "" ? undefined : Number(e.target.value))}
                                className="bg-gray-50/50"
                            />
                            <Input
                                type="number"
                                min={0}
                                placeholder="До"
                                value={props.maxPetAgeMonth ?? ""}
                                onChange={(e) => props.onMaxPetAgeChangeAction(e.target.value === "" ? undefined : Number(e.target.value))}
                                className="bg-gray-50/50"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                            <ArrowUpDown className="h-4 w-4" />
                            Сортування
                        </label>
                        <select
                            className="w-full h-10 rounded-md border border-input bg-gray-50/50 px-3 text-sm"
                            value={props.sortBy}
                            onChange={(e) => props.onSortByChangeAction(e.target.value as SortBy)}
                        >
                            <option value="dateDesc">Спочатку новіші</option>
                            <option value="dateAsc">Спочатку старіші</option>
                        </select>
                    </div>

                    <label className="flex items-center justify-between p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50/50 hover:border-blue-200 transition-colors group">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 group-hover:text-blue-700">
                            <ShieldCheck className="h-4 w-4 text-blue-500" />
                            Тільки перевірені
                        </div>
                        <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            checked={props.verifiedOnly}
                            onChange={(e) => props.onVerifiedOnlyChangeAction(e.target.checked)}
                        />
                    </label>

                    {hasFilters && (
                        <Button type="button" variant="ghost" className="w-full text-muted-foreground hover:text-red-600 hover:bg-red-50" onClick={props.onClearFiltersAction}>
                            <FilterX className="mr-2 h-4 w-4" />
                            Скинути всі фільтри
                        </Button>
                    )}
                </CardContent>
            </Card>
        </aside>
    )
}
