"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    MapPin,
    Calendar,
    Share2,
    ChevronLeft,
    Info,
    PawPrint,
    Pencil,
    AlertCircle,
    Mail,
    Phone
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

import { useAd } from "@/hook/useAd"
import { useProfile } from "@/hook/useProfile"

const PET_TYPES: Record<number, string> = { 1: "Песик", 2: "Котик", 3: "Інше" }
const PET_GENDERS: Record<number, string> = { 1: "Хлопчик", 2: "Дівчинка" }

export function AdDetail({ adId }: { adId: string }) {
    const router = useRouter()

    const { user } = useProfile()
    const { data: ad, isLoading, isError } = useAd(adId)

    const [activeImageIndex, setActiveImageIndex] = useState(0)
    const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})

    const isAuthor = Boolean(user && ad && user.id === ad.authorId)

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            toast.success("Посилання скопійовано в буфер обміну!")
        } catch {
            toast.error("Не вдалося скопіювати посилання.")
        }
    }

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto py-10 px-4 md:px-8 animate-in fade-in duration-500">
                <Skeleton className="h-8 w-40 mb-8 rounded-lg" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton className="h-[400px] w-full rounded-3xl" />
                        <div className="flex gap-4">
                            <Skeleton className="h-24 w-24 rounded-xl" />
                            <Skeleton className="h-24 w-24 rounded-xl" />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-40 w-full rounded-3xl" />
                        <Skeleton className="h-60 w-full rounded-3xl" />
                    </div>
                </div>
            </div>
        )
    }

    if (isError || !ad) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
                <div className="p-5 bg-gray-100 rounded-full mb-6 text-gray-400"><AlertCircle className="h-12 w-12" /></div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Оголошення не знайдено</h1>
                <p className="text-gray-500 mb-8 max-w-md">Можливо, воно було видалено автором або переміщено в архів.</p>
                <Button onClick={() => router.push("/ads")} size="lg" className="rounded-full shadow-sm">Переглянути інші</Button>
            </div>
        )
    }

    const images = ad.imageUrls && ad.imageUrls.length > 0 ? ad.imageUrls : []
    const activeImageUrl = images[activeImageIndex]

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 md:px-8 pb-32 animate-in fade-in duration-500">

            <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" className="text-muted-foreground hover:text-gray-900 -ml-4" onClick={() => router.back()}>
                    <ChevronLeft className="h-5 w-5 mr-1" /> Назад
                </Button>
                {isAuthor && ad.status === 2 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold uppercase tracking-wider">
                        В архіві
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                <div className="lg:col-span-8 space-y-10">
                    <div className="space-y-4">
                        <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] bg-black/5 rounded-3xl overflow-hidden border border-gray-200/50 flex items-center justify-center group">
                            {images.length > 0 && !imgErrors[activeImageUrl] ? (
                                <>
                                    <div
                                        className="absolute inset-0 w-full h-full bg-cover bg-center blur-2xl opacity-40 scale-110 transition-all duration-700"
                                        style={{ backgroundImage: `url(${activeImageUrl})` }}
                                    />
                                    <img
                                        src={activeImageUrl}
                                        alt={ad.title}
                                        className="relative z-10 w-full h-full object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                                        onError={() => setImgErrors(prev => ({ ...prev, [activeImageUrl]: true }))}
                                    />
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-gray-300 relative z-10">
                                    <PawPrint className="h-16 w-16 mb-2 opacity-50" />
                                    <span className="text-sm font-medium">Фото відсутнє</span>
                                </div>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                                {images.map((url, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={`relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${activeImageIndex === idx ? "border-primary opacity-100 shadow-md" : "border-transparent opacity-60 hover:opacity-100"}`}
                                    >
                                        {!imgErrors[url] ? (
                                            <img src={url} alt={`thumb-${idx}`} className="w-full h-full object-cover" onError={() => setImgErrors(prev => ({ ...prev, [url]: true }))} />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center"><PawPrint className="h-6 w-6 text-gray-300" /></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Info className="h-6 w-6 text-primary" /> Про хвостика
                        </h2>
                        <div className="prose prose-gray max-w-none text-base leading-relaxed text-gray-700 whitespace-pre-wrap">
                            {ad.description}
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-4">
                    <div className="sticky top-24 space-y-6">

                        <Card className="border-gray-200/60 shadow-md rounded-3xl overflow-hidden">
                            <CardContent className="p-6 sm:p-8 space-y-6">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-3">
                                        {ad.title}
                                    </h1>
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                                        {ad.city}, {ad.country}
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mt-2">
                                        <Calendar className="h-4 w-4 shrink-0" />
                                        {/* Використовуємо нативний Intl.DateTimeFormat */}
                                        Опубліковано: {new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long", year: "numeric" }).format(new Date(ad.createdAt))}
                                    </div>
                                </div>

                                <Separator className="bg-gray-100" />

                                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Вид</p>
                                        <p className="font-medium text-gray-900">{PET_TYPES[ad.petType] || "Невідомо"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Стать</p>
                                        <p className="font-medium text-gray-900">{PET_GENDERS[ad.petGender] || "Невідомо"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Вік</p>
                                        <p className="font-medium text-gray-900">
                                            {ad.petAgeMonth !== undefined && ad.petAgeMonth !== null
                                                ? `${ad.petAgeMonth} міс.`
                                                : "Невідомо"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Порода</p>
                                        <p className="font-medium text-gray-900 line-clamp-1" title={ad.petBreed}>{ad.petBreed || "Без породи"}</p>
                                    </div>
                                </div>

                                <div className="pt-4 space-y-3">
                                    {isAuthor ? (
                                        <>
                                            <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 mb-4 text-center">
                                                <p className="text-sm font-medium text-primary">🐾 Це ваше оголошення</p>
                                            </div>
                                            <Button asChild size="lg" className="w-full text-base font-semibold shadow-md cursor-pointer rounded-xl">
                                                <Link href={`/my-ads/${ad.id}/edit`}>
                                                    <Pencil className="h-5 w-5 mr-2" /> Редагувати оголошення
                                                </Link>
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button size="lg" className="w-full text-base font-semibold shadow-md rounded-xl cursor-pointer">
                                                <Phone className="h-5 w-5 mr-2" /> Показати контакти
                                            </Button>
                                            <Button size="lg" variant="outline" className="w-full text-base font-semibold bg-white rounded-xl cursor-pointer">
                                                <Mail className="h-5 w-5 mr-2" /> Написати повідомлення
                                            </Button>
                                        </>
                                    )}

                                    <Button
                                        onClick={handleShare}
                                        variant="ghost"
                                        className="w-full text-muted-foreground hover:text-gray-900 rounded-xl cursor-pointer"
                                    >
                                        <Share2 className="h-4 w-4 mr-2" /> Поділитися
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
