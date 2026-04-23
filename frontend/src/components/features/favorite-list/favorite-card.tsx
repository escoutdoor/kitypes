"use client"

import { useState } from "react"
import Link from "next/link"
import { MapPin, PawPrint, Trash2, CalendarDays } from "lucide-react"
import { toast } from "sonner"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FavoriteItem } from "@/service/favorite/favorite.interface"
import { useToggleFavorite } from "@/hook/useToggleFavorite"

type Props = {
    favorite: FavoriteItem
}

export function FavoriteCard({ favorite }: Props) {
    const ad = favorite.advertisement
    const { mutate: removeFavorite, isPending } = useToggleFavorite()
    const [imgError, setImgError] = useState(false)

    const isArchived = ad.status === 2

    const handleRemove = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        removeFavorite(
            { adId: ad.id, isCurrentlyFavorite: true },
            {
                onError: () => {
                    toast.error("Не вдалося видалити з обраного. Спробуйте ще раз.")
                }
            }
        )
    }

    return (
        <Card className={`overflow-hidden transition-all border-gray-200/60 shadow-sm hover:shadow-md bg-white ${isArchived ? "opacity-75 grayscale-[0.2]" : ""}`}>
            <div className="flex flex-col sm:flex-row h-full p-3 gap-5">
                <Link href={`/ads/${ad.id}`} className="relative w-full sm:w-64 h-56 sm:h-48 shrink-0 bg-gray-100 rounded-xl overflow-hidden border border-black/5 flex items-center justify-center group cursor-pointer">
                    {ad.imageUrls?.length && !imgError ? (
                        <img
                            src={ad.imageUrls[0]}
                            alt={ad.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <PawPrint className="h-10 w-10" />
                        </div>
                    )}
                    {isArchived && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                            <span className="px-3 py-1.5 rounded-lg text-sm font-bold text-white bg-gray-900/80 shadow-sm">
                                В архіві
                            </span>
                        </div>
                    )}
                </Link>

                <div className="flex flex-col flex-1 py-1 pr-2">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                            <Link href={`/ads/${ad.id}`} className="hover:text-primary transition-colors cursor-pointer block">
                                <h3 className="font-bold text-xl text-gray-900 line-clamp-1 mb-1">{ad.title}</h3>
                            </Link>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                                <MapPin className="h-4 w-4 shrink-0" />
                                <span className="line-clamp-1">{ad.city}, {ad.country}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                            <CalendarDays className="h-4 w-4" />
                            Збережено: {new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long" }).format(new Date(favorite.createdAt))}
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemove}
                            disabled={isPending}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-2 cursor-pointer ml-auto"
                        >
                            <Trash2 className="h-4 w-4" /> <span className="hidden sm:inline">Видалити</span>
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    )
}
