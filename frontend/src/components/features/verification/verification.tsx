"use client"

import { useState } from "react"
import { ShieldCheck, Plus, AlertCircle, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { PaginationBar } from "@/components/shared/pagination-bar/pagination-bar"

import { useMyVerifications } from "@/hook/useMyVerifications"
import { useProfile } from "@/hook/useProfile"
import { VerificationCard } from "./verification-card"
import { CreateVerificationForm } from "./create-verification-form"

const LIMIT = 10

export default function Verification() {
    const { user } = useProfile()
    const [page, setPage] = useState(1)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    const { data, isLoading, isError } = useMyVerifications({
        limit: LIMIT,
        offset: (page - 1) * LIMIT,
    })

    const requests = data?.requests || []
    const total = data?.total || 0
    const totalPages = Math.max(1, Math.ceil(total / LIMIT))

    const hasPendingRequest = requests.some(req => req.status === "pending")
    const isAlreadyMaxRole = user?.role === "admin"

    const handleSuccess = () => {
        setIsSheetOpen(false)
        setPage(1)
    }

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-64 w-full rounded-3xl" />
            </div>
        )
    }

    if (isError) {
        return (
            <div className="max-w-3xl mx-auto py-12 flex flex-col items-center text-center">
                <div className="p-4 bg-red-50 text-red-500 rounded-full mb-4">
                    <AlertCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Сталася помилка</h2>
                <p className="text-gray-500">Не вдалося завантажити історію верифікацій. Спробуйте оновити сторінку.</p>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3.5 rounded-2xl shrink-0 border border-primary/10">
                        <ShieldCheck className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Верифікація</h1>
                        <p className="text-muted-foreground text-[15px] font-medium mt-1">
                            Підвищіть рівень довіри до ваших оголошень
                        </p>
                    </div>
                </div>

                {!isAlreadyMaxRole && (
                    <Button
                        onClick={() => setIsSheetOpen(true)}
                        disabled={hasPendingRequest}
                        className="rounded-xl shadow-sm hover:shadow-md transition-all font-bold shrink-0 cursor-pointer disabled:cursor-not-allowed"
                    >
                        <Plus className="w-5 h-5 mr-1" /> Подати заявку
                    </Button>
                )}
            </div>

            {hasPendingRequest && (
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-amber-800 text-sm font-medium">
                    У вас є активна заявка, яка зараз розглядається адміністратором. Ви зможете подати нову лише після того, як поточна отримає статус.
                </div>
            )}

            {requests.length === 0 && page === 1 ? (
                <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-10 text-center flex flex-col items-center">
                    <div className="bg-gray-50 p-5 rounded-full mb-5">
                        <FileText className="w-12 h-12 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">У вас ще немає заявок</h3>
                    <p className="text-gray-500 max-w-md mx-auto leading-relaxed mb-8">
                        Отримайте статус Волонтера чи Притулку. Це покаже іншим користувачам, що ви надійний куратор, і ваші улюблені тваринки швидше знайдуть дім.
                    </p>
                    <Button
                        size="lg"
                        onClick={() => setIsSheetOpen(true)}
                        className="rounded-xl font-bold px-8 shadow-sm cursor-pointer"
                    >
                        Почати верифікацію
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 px-1">Історія заявок</h2>
                    {requests.map(req => (
                        <VerificationCard key={req.id} item={req} />
                    ))}

                    {totalPages > 1 && (
                        <div className="mt-8">
                            <PaginationBar
                                page={page}
                                totalPages={totalPages}
                                onPageChangeAction={setPage}
                            />
                        </div>
                    )}
                </div>
            )}

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="right" className="w-full sm:max-w-md md:max-w-lg overflow-y-auto bg-white p-6 sm:p-8 custom-scrollbar">
                    <SheetHeader className="mb-8">
                        <SheetTitle className="text-2xl font-bold text-gray-900">Нова заявка</SheetTitle>
                        <SheetDescription className="text-base text-gray-500 leading-relaxed mt-2">
                            Заповніть форму нижче та прикріпіть необхідні документи. Ми розглянемо заявку найближчим часом.
                        </SheetDescription>
                    </SheetHeader>

                    <CreateVerificationForm onSuccessAction={handleSuccess} />
                </SheetContent>
            </Sheet>
        </div>
    )
}
