"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Calendar, Loader2, Phone, User, AlertCircle, ShieldCheck, LayoutGrid } from "lucide-react"
import { toast } from "sonner"

import { usePublicUser } from "@/hook/usePublicUser"
import { useUserPhone } from "@/hook/useUserPhone"
import { useAds } from "@/hook/useAds"
import { useProfile } from "@/hook/useProfile"
import { useAuthStore } from "@/store/auth.store"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PaginationBar } from "@/components/shared/pagination-bar/pagination-bar"
import { VerificationBadge } from "@/components/shared/verification-badge/verification-badge"
import { Card } from "@/components/ui/card"
import { AdCard } from "../ad-list/ad-card"

const LIMIT = 12

export function PublicUserView({ userId }: { userId: string }) {
    const router = useRouter()

    const { isAuthenticated } = useAuthStore()
    const { user: currentUser } = useProfile()

    const [page, setPage] = useState(1)
    const [revealedPhone, setRevealedPhone] = useState<string | null>(null)

    const { data: userData, isLoading: isUserLoading, isError: isUserError } = usePublicUser(userId)
    const { mutateAsync: fetchPhone, isPending: isPhoneLoading } = useUserPhone()

    // Отримуємо тільки АКТИВНІ оголошення цього юзера
    const { data: adsData, isLoading: isAdsLoading } = useAds({
        authorId: userId,
        status: 1,
        limit: LIMIT,
        offset: (page - 1) * LIMIT,
    })

    const user = userData?.user
    const ads = adsData?.advertisements || []
    const totalAds = adsData?.total || 0
    const totalPages = Math.max(1, Math.ceil(totalAds / LIMIT))

    const isVerified = user?.role === "volunteer" || user?.role === "shelter"
    const isAdmin = currentUser?.role === "admin"

    const handleRevealPhone = async () => {
        if (!isAuthenticated) {
            toast.info("Потрібна авторизація", {
                description: "Будь ласка, увійдіть у свій акаунт, щоб переглянути контакти.",
                action: { label: "Увійти", onClick: () => router.push("/login") },
            })
            return
        }

        try {
            const data = await fetchPhone(userId)
            setRevealedPhone(data.phone)
        } catch (error) {
            toast.error("Не вдалося отримати номер телефону")
        }
    }

    if (isUserLoading) {
        return (
            <div className="max-w-5xl mx-auto py-8 px-4 md:px-6 animate-pulse">
                <Card className="rounded-3xl shadow-sm border border-gray-100 overflow-visible mb-16 bg-white relative">
                    <div className="h-32 bg-gray-100 w-full rounded-t-3xl"></div>
                    <div className="px-6 sm:px-10 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6 relative z-10">
                        <div className="-mt-16 h-[120px] w-[120px] rounded-full border-4 border-white bg-gray-200 shrink-0"></div>
                        <div className="flex-1 space-y-3 w-full flex flex-col items-center md:items-start pt-2">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                        <Skeleton className="h-14 w-full md:w-[280px] rounded-xl shrink-0" />
                    </div>
                </Card>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-80 w-full rounded-2xl" />)}
                </div>
            </div>
        )
    }

    if (isUserError || !user) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <div className="p-5 bg-gray-100 rounded-full mb-6 text-gray-400">
                    <AlertCircle className="h-12 w-12" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Користувача не знайдено</h1>
                <p className="text-gray-500 mb-8 max-w-md">Можливо, профіль було видалено або заблоковано модератором.</p>
                <Button onClick={() => router.push("/ads")} size="lg" className="rounded-full cursor-pointer">
                    Переглянути оголошення
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 md:px-6 animate-in fade-in duration-500">

            {/* Header Профілю з банером */}
            <Card className="rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-12 bg-white relative">
                {/* Елегантний бекграунд банер (кольори як на скріншоті) */}
                <div className="h-32 bg-gradient-to-r from-orange-50 via-red-50 to-orange-100/50 w-full"></div>

                <div className="px-6 sm:px-8 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6 relative z-10">

                    {/* Аватар, що наїжджає на банер */}
                    <div className="-mt-16 h-[120px] w-[120px] rounded-full border-4 border-white bg-gray-100 shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.firstName} className="h-full w-full object-cover" />
                        ) : (
                            <User className="h-12 w-12 text-gray-400" />
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-3 pb-1">
                        <div className="flex flex-col md:flex-row items-center gap-3">
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                {user.firstName} {user.lastName}
                            </h1>
                            {isVerified && <VerificationBadge role={user.role} showText />}
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-sm font-medium text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
                                <span>На платформі з {new Intl.DateTimeFormat("uk-UA", { month: "long", year: "numeric" }).format(new Date(user.createdAt))}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <LayoutGrid className="h-4 w-4 shrink-0 text-gray-400" />
                                <span>{totalAds} активних оголошень</span>
                            </div>

                            {/* Кнопка для Адміна */}
                            {isAdmin && (
                                <Link
                                    href={`/admin/users?search=${user.firstName}`}
                                    className="flex items-center gap-1.5 text-primary hover:underline cursor-pointer"
                                >
                                    <ShieldCheck className="h-4 w-4 shrink-0" />
                                    <span>Відкрити в адмінці</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="w-full md:w-[280px] h-14 shrink-0 md:pt-2">
                        {revealedPhone ? (
                            <div className="flex items-center gap-2 px-3 h-full bg-gray-50 border border-gray-200 rounded-xl animate-in fade-in zoom-in-95 duration-200 w-full">
                                <div className="p-2 bg-white rounded-lg shadow-sm shrink-0 flex items-center justify-center">
                                    <Phone className="h-4 w-4 text-gray-700" />
                                </div>
                                <span className="flex-1 text-base font-bold text-gray-900 select-all tracking-wide whitespace-nowrap overflow-hidden text-ellipsis text-center md:text-left">
                                    {revealedPhone}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        navigator.clipboard.writeText(revealedPhone)
                                        toast.success("Номер скопійовано!")
                                    }}
                                    className="shrink-0 text-xs font-medium cursor-pointer bg-white"
                                >
                                    Копіювати
                                </Button>
                            </div>
                        ) : (
                            <Button
                                className="w-full h-full text-base font-semibold shadow-md rounded-xl cursor-pointer"
                                onClick={handleRevealPhone}
                                disabled={isPhoneLoading}
                            >
                                {isPhoneLoading ? (
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                ) : (
                                    <Phone className="h-5 w-5 mr-2" />
                                )}
                                {isPhoneLoading ? "Завантаження..." : "Показати контакти"}
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Блок оголошень (без табів) */}
            <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-gray-900">
                    Шукають дім
                </h2>
            </div>

            <div className="min-h-[400px]">
                {isAdsLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-80 w-full rounded-2xl" />)}
                    </div>
                ) : ads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed">
                        <div className="p-4 bg-gray-50 rounded-full mb-4">
                            <LayoutGrid className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Немає активних оголошень</h3>
                        <p className="text-muted-foreground">
                            Цей користувач наразі не має тваринок, які шукають дім.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                            {ads.map(ad => (
                                <AdCard key={ad.id} ad={ad} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center">
                                <PaginationBar page={page} totalPages={totalPages} onPageChangeAction={setPage} />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
