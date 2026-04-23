import Link from "next/link"
import { Calendar, MapPin, Mars, PawPrint, Venus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Ad } from "@/service/ad/ad.interface"

import { FavoriteButton } from "@/components/shared/favorite-button/favorite-button"
import { formatPetAge } from "@/lib/utils"

function formatDate(v: string) {
    const d = new Date(v)
    return Number.isNaN(d.getTime())
        ? "—"
        : new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "short" }).format(d)
}

export function AdCard({ ad }: { ad: Ad }) {
    return (
        <Link href={`/ads/${ad.id}`} className="group block min-w-0">
            <Card className="h-full min-w-0 border-none shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden rounded-2xl bg-white flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">

                    <div className="absolute top-3 left-3 z-10">
                        <FavoriteButton
                            adId={ad.id}
                            initialIsFavorite={!!ad.isFavorite}
                        />
                    </div>

                    {ad.imageUrls?.length ? (
                        <img
                            src={ad.imageUrls[0]}
                            alt={ad.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <PawPrint className="h-10 w-10" />
                        </div>
                    )}

                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                        {ad.petGender === 1 ? (
                            <>
                                <Mars className="h-3 w-3 text-blue-500" />
                                <span className="text-blue-700">Хлопчик</span>
                            </>
                        ) : (
                            <>
                                <Venus className="h-3 w-3 text-pink-500" />
                                <span className="text-pink-700">Дівчинка</span>
                            </>
                        )}
                    </div>
                </div>

                <CardContent className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-xl text-gray-900 line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                        {ad.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-1">
                            {ad.city}, {ad.country}
                        </span>
                    </div>

                    <div className="mt-auto pt-4 border-t flex items-center justify-between text-xs text-gray-500 font-medium">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(ad.createdAt)}
                        </div>

                        {typeof ad.petAgeMonth === "number" && (
                            <span className="bg-gray-100 px-2 py-1 rounded-md text-gray-600">
                                {formatPetAge(ad.petAgeMonth)}
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
