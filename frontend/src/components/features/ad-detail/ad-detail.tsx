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
    Phone,
    ShieldCheck,
    User,
    Loader2
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

import { useAd } from "@/hook/useAd"
import { useProfile } from "@/hook/useProfile"
import { useAuthStore } from "@/store/auth.store"
import { usePhone } from "@/hook/usePhone"
import { FavoriteButton } from "@/components/shared/favorite-button/favorite-button"
import { formatPetAge } from "@/lib/utils"
import { ContactAuthorForm } from "./contact-author-form"

const PET_TYPES: Record<number, string> = { 1: "Песик", 2: "Котик", 3: "Інше" }
const PET_GENDERS: Record<number, string> = { 1: "Хлопчик", 2: "Дівчинка" }

export function AdDetail({ adId }: { adId: string }) {
    const router = useRouter()

    const { user } = useProfile()
    const { isAuthenticated } = useAuthStore()
    const { data: ad, isLoading, isError } = useAd(adId)
    const { mutateAsync: fetchPhone, isPending: isLoadingPhone } = usePhone()

    const [activeImageIndex, setActiveImageIndex] = useState(0)
    const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})
    const [revealedPhone, setRevealedPhone] = useState<string | null>(null)

    const isAuthor = Boolean(user && ad && user.id === ad.authorId)

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            toast.success("Посилання скопійовано в буфер обміну!")
        } catch {
            toast.error("Не вдалося скопіювати посилання.")
        }
    }

    const handleRevealPhone = async () => {
        if (!isAuthenticated) {
            toast.info("Потрібна авторизація", {
                description: "Будь ласка, увійдіть у свій акаунт, щоб переглянути контакти власника.",
                action: {
                    label: "Увійти",
                    onClick: () => router.push("/login"),
                },
            })
            return
        }

        if (revealedPhone) return

        try {
            const data = await fetchPhone(adId)
            setRevealedPhone(data.phone)
        } catch (error) {
            console.error(error)
            toast.error("Не вдалося завантажити контакти власника.")
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
                <Button onClick={() => router.push("/ads")} size="lg" className="rounded-full shadow-sm cursor-pointer">Переглянути інші</Button>
            </div>
        )
    }

    const images = ad.imageUrls && ad.imageUrls.length > 0 ? ad.imageUrls : []
    const activeImageUrl = images[activeImageIndex]

    const authorName = ad.authorName || "Користувач платформи"

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 md:px-8 pb-32 animate-in fade-in duration-500">

            <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" className="text-muted-foreground hover:text-gray-900 -ml-4 cursor-pointer" onClick={() => router.back()}>
                    <ChevronLeft className="h-5 w-5 mr-1" /> Назад
                </Button>
                {ad.status === 2 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold uppercase tracking-wider">
                        В архіві
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                <div className="lg:col-span-7 xl:col-span-8 space-y-10">

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

                    <section className="bg-blue-50/50 rounded-3xl p-6 sm:p-8 border border-blue-100/50">
                        <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-blue-500" /> Поради щодо безпечної адопції
                        </h3>
                        <ul className="space-y-3 text-sm text-blue-800/80">
                            <li className="flex gap-2"><div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" /> Зустрічайтеся з власником у безпечних публічних місцях.</li>
                            <li className="flex gap-2"><div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" /> Завжди оглядайте тваринку перед тим, як забрати додому.</li>
                            <li className="flex gap-2"><div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" /> Розпитайте про наявність щеплень, паспортів та звичок хвостика.</li>
                        </ul>
                    </section>
                </div>

                <div className="lg:col-span-5 xl:col-span-4">
                    <div className="sticky top-24 space-y-6">

                        <Card className="border-gray-200/60 shadow-md rounded-3xl overflow-hidden bg-white">
                            <CardContent className="p-6 sm:p-8 space-y-6">

                                <div className="flex justify-between items-start gap-4">
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
                                            Опубліковано: {new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long", year: "numeric" }).format(new Date(ad.createdAt))}
                                        </div>
                                    </div>

                                    <FavoriteButton adId={ad.id} initialIsFavorite={!!ad.isFavorite} className="shrink-0 bg-gray-50 border border-gray-100" />
                                </div>

                                <Separator className="bg-gray-100" />

                                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                    <div>
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Вид</p>
                                        <p className="font-semibold text-gray-900">{PET_TYPES[ad.petType] || "Невідомо"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Стать</p>
                                        <p className="font-semibold text-gray-900">{PET_GENDERS[ad.petGender] || "Невідомо"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Вік</p>
                                        <p className="font-semibold text-gray-900">
                                            {formatPetAge(ad.petAgeMonth)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Порода</p>
                                        <p className="font-semibold text-gray-900 line-clamp-1" title={ad.petBreed}>{ad.petBreed || "Без породи"}</p>
                                    </div>
                                </div>

                            </CardContent>
                        </Card>

                        <Card className="border-gray-200/60 shadow-sm rounded-3xl overflow-hidden bg-white">
                            <CardContent className="p-6 sm:p-8 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                                        {ad.authorAvatarUrl ? (
                                            <img
                                                src={ad.authorAvatarUrl}
                                                alt={authorName}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <User className="h-6 w-6 text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium mb-0.5">Власник</p>
                                        <p className="font-bold text-gray-900 text-lg">{authorName}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {isAuthor ? (
                                        <>
                                            <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 mb-2 text-center">
                                                <p className="text-sm font-medium text-primary">🐾 Це ваше оголошення</p>
                                            </div>
                                            <Button asChild size="lg" className="w-full text-base font-semibold shadow-md cursor-pointer rounded-xl">
                                                <Link href={`/my-ads/${ad.id}/edit`}>
                                                    <Pencil className="h-5 w-5 mr-2" /> Редагувати
                                                </Link>
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            {revealedPhone ? (
                                                <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl animate-in fade-in zoom-in-95 duration-200 w-full">
                                                    <div className="p-2 bg-white rounded-lg shadow-sm shrink-0 flex items-center justify-center">
                                                        <Phone className="h-4 w-4 text-gray-700" />
                                                    </div>

                                                    <span className="flex-1 text-base font-bold text-gray-900 select-all tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
                                                        {revealedPhone}
                                                    </span>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(revealedPhone)
                                                            toast.success("Номер скопійовано!")
                                                        }}
                                                        className="shrink-0 text-xs font-medium cursor-pointer"
                                                    >
                                                        Копіювати
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    size="lg"
                                                    className="w-full text-base font-semibold shadow-md rounded-xl cursor-pointer"
                                                    onClick={handleRevealPhone}
                                                    disabled={isLoadingPhone}
                                                >
                                                    {isLoadingPhone ? (
                                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                    ) : (
                                                        <Phone className="h-5 w-5 mr-2" />
                                                    )}
                                                    {isLoadingPhone ? "Завантаження..." : "Показати контакти"}
                                                </Button>
                                            )}
                                            <ContactAuthorForm adId={adId} />
                                        </>
                                    )}

                                    <Button
                                        onClick={handleShare}
                                        variant="ghost"
                                        className="w-full text-muted-foreground hover:text-gray-900 rounded-xl cursor-pointer mt-2"
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
