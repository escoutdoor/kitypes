"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, MapPin, PawPrint, Pencil, Trash2, Ban } from "lucide-react" // Додано Ban
import { toast } from "sonner"

import { Ad, AD_STATUS } from "@/service/ad/ad.interface"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { useChangeAdStatus } from "@/hook/useChangeAdStatus"
import { useDeleteAd } from "@/hook/useDeleteAd"

type Props = {
    ad: Ad
}

export function MyAdCard({ ad }: Props) {
    const { mutate: deleteAd, isPending: isDeleting } = useDeleteAd()
    const { mutate: changeStatus, isPending: isChangingStatus } = useChangeAdStatus()

    const [imgError, setImgError] = useState(false)

    const isActive = ad.status === AD_STATUS.OPENED
    const isArchived = ad.status === AD_STATUS.CLOSED
    const isBlocked = ad.status === AD_STATUS.BLOCKED

    const isLoading = isDeleting || isChangingStatus
    const isActionsDisabled = isLoading || isBlocked

    const handleDelete = () => {
        deleteAd(ad.id, {
            onSuccess: () => toast.success("Оголошення успішно видалено"),
            onError: () => toast.error("Не вдалося видалити оголошення"),
        })
    }

    const handleStatusChange = () => {
        const newStatus = isActive ? AD_STATUS.CLOSED : AD_STATUS.OPENED
        changeStatus({ id: ad.id, status: newStatus }, {
            onSuccess: () => toast.success(isActive ? "Оголошення переміщено в архів" : "Оголошення активовано"),
            onError: () => toast.error("Не вдалося змінити статус"),
        })
    }

    return (
        <Card className={`overflow-hidden transition-all border-gray-200/60 shadow-sm hover:shadow-md ${(isArchived || isBlocked) ? "opacity-80 grayscale-[0.2]" : ""}`}>
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
                    <div className="absolute top-3 left-3 flex gap-2">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold text-white shadow-sm backdrop-blur-md 
                            ${isActive ? "bg-green-500/90" :
                                isBlocked ? "bg-red-500/90 flex items-center gap-1" : "bg-gray-600/90"}`}>
                            {isBlocked && <Ban className="w-3 h-3" />}
                            {isActive ? "Активне" : isBlocked ? "Заблоковано" : "В архіві"}
                        </span>
                    </div>
                </Link>

                <div className="flex flex-col flex-1 py-1 pr-2">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <Link href={`/ads/${ad.id}`} className="hover:text-primary transition-colors cursor-pointer block">
                                <h3 className="font-bold text-xl text-gray-900 line-clamp-1 mb-1">{ad.title}</h3>
                            </Link>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                                <MapPin className="h-4 w-4 shrink-0" />
                                <span className="line-clamp-1">{ad.city}, {ad.country}</span>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 font-medium whitespace-nowrap bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                            {new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "short", year: "numeric" }).format(new Date(ad.createdAt))}
                        </div>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100">
                        <Button asChild variant="outline" size="sm" className="gap-2 cursor-pointer shadow-sm hover:bg-gray-50" disabled={isActionsDisabled}>
                            <Link href={isBlocked ? "#" : `/my-ads/${ad.id}/edit`} className={isBlocked ? "pointer-events-none" : ""}>
                                <Pencil className="h-3.5 w-3.5" /> Редагувати
                            </Link>
                        </Button>

                        <Button
                            variant="secondary"
                            size="sm"
                            className={`gap-2 shadow-sm ${(!isActive && !isBlocked) && "bg-green-50 text-green-700 hover:bg-green-100"}`}
                            disabled={isActionsDisabled}
                            onClick={handleStatusChange}
                        >
                            {isActive ? <><EyeOff className="h-3.5 w-3.5" /> В архів</> : <><Eye className="h-3.5 w-3.5" /> Активувати</>}
                        </Button>

                        <div className="ml-auto">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-2 cursor-pointer" disabled={isLoading}>
                                        <Trash2 className="h-4 w-4" /> <span className="hidden sm:inline">Видалити</span>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Ви впевнені?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Це безповоротно видалить оголошення <span className="font-semibold text-gray-900">"{ad.title}"</span> та всі його фотографії з системи.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="cursor-pointer">Скасувати</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white cursor-pointer">
                                            Видалити
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
}
