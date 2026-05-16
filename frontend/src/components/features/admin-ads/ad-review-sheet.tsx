"use client"

import { Ban, CheckCircle2, ExternalLink, Loader2, Calendar, MapPin, AlertCircle, User as UserIcon, Flag } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Card, CardContent } from "@/components/ui/card"

import { AD_STATUS } from "@/service/ad/ad.interface"
import { useAd } from "@/hook/useAd"
import { useUpdateAdminAdStatus } from "@/hook/useUpdateAdminAdStatus"
import { formatPetAge, cn } from "@/lib/utils"
import Link from "next/link"

const STATUS_LABELS: Record<number, string> = {
    [AD_STATUS.OPENED]: "Відкрите",
    [AD_STATUS.CLOSED]: "Закрите",
    [AD_STATUS.BLOCKED]: "Заблоковане",
}

type Props = {
    adId: string | null
    isOpen: boolean
    onOpenChangeAction: (open: boolean) => void
}

export function AdReviewSheet({ adId, isOpen, onOpenChangeAction }: Props) {
    const { data: ad, isLoading: isFetchingAd } = useAd(adId || "")
    const { mutateAsync: updateStatus, isPending } = useUpdateAdminAdStatus()

    if (!isOpen) return null

    if (isFetchingAd || !ad) {
        return (
            <Sheet open={isOpen} onOpenChange={onOpenChangeAction}>
                <SheetContent side="right" className="flex items-center justify-center">
                    <SheetTitle className="sr-only">Завантаження деталей оголошення</SheetTitle>
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </SheetContent>
            </Sheet>
        )
    }

    const handleUnblock = async () => {
        try {
            await updateStatus({ id: ad.id, data: { status: AD_STATUS.OPENED } })
            toast.success("Оголошення успішно розблоковано")
            onOpenChangeAction(false)
        } catch {
            toast.error("Не вдалося розблокувати оголошення")
        }
    }

    const handleBlock = async () => {
        try {
            await updateStatus({ id: ad.id, data: { status: AD_STATUS.BLOCKED } })
            toast.success("Оголошення заблоковано")
            onOpenChangeAction(false)
        } catch {
            toast.error("Не вдалося заблокувати оголошення")
        }
    }

    const isBlocked = ad.status === AD_STATUS.BLOCKED
    const hasImages = ad.imageUrls && ad.imageUrls.length > 0

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChangeAction}>
            <SheetContent side="right" className="w-full sm:max-w-md md:max-w-xl p-0 bg-gray-50 flex flex-col sm:max-w-none">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Header */}
                    <div className="bg-white p-6 sm:p-8 border-b border-gray-100">
                        <SheetHeader className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                    ad.status === AD_STATUS.OPENED && "bg-emerald-100 text-emerald-700",
                                    ad.status === AD_STATUS.CLOSED && "bg-gray-100 text-gray-600",
                                    ad.status === AD_STATUS.BLOCKED && "bg-red-100 text-red-700"
                                )}>
                                    {STATUS_LABELS[ad.status] || ad.status}
                                </span>
                                <Button asChild variant="outline" size="sm" className="cursor-pointer">
                                    <a href={`/ads/${ad.id}`} target="_blank" rel="noopener noreferrer">
                                        Відкрити на сайті <ExternalLink className="w-4 h-4 ml-2" />
                                    </a>
                                </Button>
                            </div>
                            <SheetTitle className="text-2xl font-bold text-gray-900 leading-tight">
                                {ad.title}
                            </SheetTitle>
                            <SheetDescription className="flex items-center gap-2 mt-2">
                                <Calendar className="w-4 h-4" />
                                Створено: {new Intl.DateTimeFormat("uk-UA", {
                                    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                                }).format(new Date(ad.createdAt))}
                            </SheetDescription>
                        </SheetHeader>
                    </div>

                    <div className="p-6 sm:p-8 space-y-8">
                        {/* Інсайти модерації */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Інсайти модерації</h3>

                            {isBlocked && ad.blockReason && (
                                <div className="bg-red-50 text-red-900 p-4 rounded-xl border border-red-100 flex gap-3 text-sm">
                                    <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                                    <div className="font-medium whitespace-pre-wrap">{ad.blockReason}</div>
                                </div>
                            )}

                            <Card className="border-none shadow-sm">
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                            <UserIcon className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium mb-0.5">Автор ({ad.authorRole})</p>
                                            <p className="font-bold text-gray-900">{ad.authorName}</p>
                                            <p className="text-xs text-gray-400 font-mono mt-0.5 select-all" title="Натисніть щоб виділити ID">
                                                ID: {ad.authorId}
                                            </p>
                                        </div>
                                        <Button asChild variant="outline" size="sm" className="ml-5 shrink-0 cursor-pointer">
                                            <Link href={`/users/${ad.authorId}`} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="w-4 h-4 mr-1.5" /> Профіль
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* ДОДАНО: Кнопка переходу до скарг */}
                            <Button asChild variant="outline" className="justify-start cursor-pointer w-full text-gray-700 h-12 shadow-sm border-gray-200 hover:bg-gray-50">
                                <Link href={`/admin/reports?targetType=ad&targetId=${ad.id}`}>
                                    <Flag className="w-4 h-4 mr-3 text-red-500" />
                                    Переглянути всі скарги на це оголошення
                                </Link>
                            </Button>
                        </section>

                        {/* Фотографії */}
                        <section>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Фотографії</h3>
                            {hasImages ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {ad.imageUrls.map((url, idx) => (
                                        <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block aspect-square overflow-hidden rounded-xl border border-gray-200 hover:border-primary/50 transition-colors cursor-pointer">
                                            <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-gray-100 rounded-xl p-8 text-center text-sm text-gray-500 font-medium">
                                    Фотографії відсутні
                                </div>
                            )}
                        </section>

                        {/* Інформація */}
                        <section>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Деталі</h3>
                            <Card className="border-none shadow-sm">
                                <CardContent className="p-5 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium mb-1">Вік</p>
                                            <p className="font-semibold text-gray-900">{formatPetAge(ad.petAgeMonth)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium mb-1">Стать</p>
                                            <p className="font-semibold text-gray-900">{ad.petGender === 1 ? "Хлопчик" : "Дівчинка"}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium mb-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Локація</p>
                                        <p className="font-semibold text-gray-900">{ad.city}, {ad.country}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Опис */}
                        <section>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Опис</h3>
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-[15px] text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {ad.description}
                                </p>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-white border-t border-gray-100 flex items-center gap-3 shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-10">
                    {isBlocked ? (
                        <Button
                            size="lg"
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm cursor-pointer text-base"
                            onClick={handleUnblock}
                            disabled={isPending}
                        >
                            {isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                            Розблокувати оголошення
                        </Button>
                    ) : (
                        <Button
                            size="lg"
                            variant="destructive"
                            className="w-full shadow-sm cursor-pointer text-base"
                            onClick={handleBlock}
                            disabled={isPending}
                        >
                            {isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Ban className="w-5 h-5 mr-2" />}
                            Заблокувати оголошення
                        </Button>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
