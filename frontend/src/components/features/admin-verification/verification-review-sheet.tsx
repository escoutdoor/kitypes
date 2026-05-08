"use client"

import { useState } from "react"
import { Check, X, FileText, Phone, Mail, Clock, ExternalLink, Loader2, Image as ImageIcon, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { AdminVerificationItem } from "@/service/admin-verification/admin-verification.interface"
import { cn } from "@/lib/utils"
import { useUpdateVerificationStatus } from "@/hook/useUpdateVerificationStatus"

type Props = {
    request: AdminVerificationItem | null
    isOpen: boolean
    onOpenChangeAction: (open: boolean) => void
}

const ROLE_LABELS = {
    volunteer: "Волонтер",
    shelter: "Притулок",
    user: "Користувач",
    admin: "Адміністратор",
}

function getFileType(url: string): "image" | "pdf" | "unknown" {
    try {
        const pathname = new URL(url).pathname
        const ext = pathname.split('.').pop()?.toLowerCase()
        if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) return 'image'
        if (ext === 'pdf') return 'pdf'
    } catch (e) {
    }
    return 'unknown'
}

function DocumentPreview({ url, index }: { url: string, index: number }) {
    const type = getFileType(url)
    const [imgError, setImgError] = useState(false)

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block overflow-hidden rounded-2xl border border-gray-200 hover:border-primary/50 hover:shadow-md transition-all h-32 sm:h-40 bg-gray-50 cursor-pointer"
        >
            {type === 'image' && !imgError ? (
                <div className="absolute inset-0">
                    <img
                        src={url}
                        alt={`Документ ${index}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => setImgError(true)}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-primary transition-colors bg-white">
                    <div className="p-3 bg-gray-50 group-hover:bg-primary/5 rounded-full mb-2 transition-colors">
                        {type === 'pdf' ? <FileText className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                    </div>
                    <span className="text-xs font-bold text-gray-600 group-hover:text-primary">
                        Документ {index} {type === 'pdf' && '(PDF)'}
                    </span>
                </div>
            )}

            <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm p-1.5 rounded-lg text-gray-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0">
                <ExternalLink className="w-4 h-4" />
            </div>
        </a>
    )
}

export function VerificationReviewSheet({ request, isOpen, onOpenChangeAction }: Props) {
    const { mutateAsync: updateStatus, isPending } = useUpdateVerificationStatus()

    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
    const [adminNotes, setAdminNotes] = useState("")

    if (!request) return null

    const handleApprove = async () => {
        try {
            await updateStatus({ id: request.id, data: { status: "approved" } })
            toast.success("Заявку успішно схвалено!")
            onOpenChangeAction(false)
        } catch (error) {
            toast.error("Помилка при схваленні заявки.")
        }
    }

    const handleReject = async () => {
        if (!adminNotes.trim()) {
            toast.error("Вкажіть причину відмови.")
            return
        }
        try {
            await updateStatus({
                id: request.id,
                data: { status: "rejected", adminNotes: adminNotes.trim() }
            })
            toast.success("Заявку відхилено.")
            setIsRejectDialogOpen(false)
            setAdminNotes("")
            onOpenChangeAction(false)
        } catch (error) {
            toast.error("Помилка при відхиленні заявки.")
        }
    }

    const isPendingStatus = request.status === "pending"
    const initials = `${request.user.firstName[0]}${request.user.lastName[0]}`.toUpperCase()

    return (
        <>
            <Sheet open={isOpen} onOpenChange={onOpenChangeAction}>
                <SheetContent side="right" className="w-full sm:max-w-md md:max-w-xl p-0 bg-gray-50 flex flex-col sm:max-w-none">

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="bg-white p-6 sm:p-8 border-b border-gray-100">
                            <SheetHeader className="mb-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                        request.status === "pending" && "bg-amber-100 text-amber-700",
                                        request.status === "approved" && "bg-emerald-100 text-emerald-700",
                                        request.status === "rejected" && "bg-red-100 text-red-700"
                                    )}>
                                        {request.status === "pending" && "Очікує розгляду"}
                                        {request.status === "approved" && "Схвалено"}
                                        {request.status === "rejected" && "Відхилено"}
                                    </span>
                                </div>
                                <SheetTitle className="text-2xl font-bold text-gray-900">
                                    Заявка на статус: <span className="text-primary">{ROLE_LABELS[request.requestedRole]}</span>
                                </SheetTitle>
                                <SheetDescription className="flex items-center gap-2 mt-2">
                                    <Clock className="w-4 h-4" />
                                    Отримано: {new Intl.DateTimeFormat("uk-UA", {
                                        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                                    }).format(new Date(request.createdAt))}
                                </SheetDescription>
                            </SheetHeader>
                        </div>

                        <div className="p-6 sm:p-8 space-y-8">
                            <section>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Дані користувача</h3>
                                <Card className="border-none shadow-sm">
                                    <CardContent className="p-5 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-11 w-11 border border-gray-100 shadow-sm shrink-0">
                                                <AvatarImage src={request.user.avatarUrl} alt={request.user.firstName} className="object-cover" />
                                                <AvatarFallback className="bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm text-gray-500 font-medium">Повне ім'я</p>
                                                <p className="font-bold text-gray-900">{request.user.firstName} {request.user.lastName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                                <Mail className="w-5 h-5 text-gray-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm text-gray-500 font-medium">Email</p>
                                                <a href={`mailto:${request.user.email}`} className="font-bold text-gray-900 hover:text-primary transition-colors truncate block">
                                                    {request.user.email}
                                                </a>
                                            </div>
                                        </div>
                                        {request.user.phoneNumber && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                                    <Phone className="w-5 h-5 text-gray-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 font-medium">Телефон</p>
                                                    <a href={`tel:${request.user.phoneNumber}`} className="font-bold text-gray-900 hover:text-primary transition-colors">
                                                        {request.user.phoneNumber}
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </section>

                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        Документи
                                        {request.status === "pending" && (
                                            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                                                {request.documentUrls.length}
                                            </span>
                                        )}
                                    </h3>
                                </div>

                                {request.status === "pending" ? (
                                    request.documentUrls.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                            {request.documentUrls.map((url, idx) => (
                                                <DocumentPreview key={idx} url={url} index={idx + 1} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                                            <p className="text-gray-500 text-sm font-medium">Документи не були прикріплені.</p>
                                        </div>
                                    )
                                ) : (
                                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 text-center">
                                        <div className="mx-auto w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                                            <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <p className="text-sm font-medium text-emerald-800">
                                            З міркувань безпеки документи були назавжди видалені з серверів після обробки заявки.
                                        </p>
                                    </div>
                                )}
                            </section>

                            {request.adminNotes && (
                                <section>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Коментар адміністратора</h3>
                                    <div className="bg-gray-100 p-4 rounded-2xl border border-gray-200">
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-medium">
                                            {request.adminNotes}
                                        </p>
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>

                    {isPendingStatus && (
                        <div className="p-6 bg-white border-t border-gray-100 flex items-center gap-3 shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-10">
                            <Button
                                variant="outline"
                                size="lg"
                                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                                onClick={() => setIsRejectDialogOpen(true)}
                                disabled={isPending}
                            >
                                <X className="w-5 h-5 mr-2" /> Відхилити
                            </Button>
                            <Button
                                size="lg"
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm cursor-pointer"
                                onClick={handleApprove}
                                disabled={isPending}
                            >
                                {isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Check className="w-5 h-5 mr-2" />}
                                Схвалити
                            </Button>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <AlertDialogContent className="sm:max-w-[425px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Відхилити заявку</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вкажіть причину відмови. Цей коментар побачить користувач у своєму особистому кабінеті.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Наприклад: Завантажені документи нерозбірливі. Будь ласка, зробіть чіткіше фото."
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            className="min-h-[120px] resize-none"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => { setIsRejectDialogOpen(false); setAdminNotes(""); }} disabled={isPending}>
                            Скасувати
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReject}
                            disabled={!adminNotes.trim() || isPending}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Підтвердити відмову
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
