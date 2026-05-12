"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Ban, CheckCircle2, ExternalLink, Loader2, MessageSquare, User, X, UserMinus } from "lucide-react"
import { toast } from "sonner"
import { isAxiosError } from "axios"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

import { EnrichedReport, REPORT_REASON, REPORT_STATUS, REPORT_TARGET_TYPE } from "@/service/report/report.interface"
import { useReport } from "@/hook/useReport"
import { useUpdateReportStatus } from "@/hook/useUpdateReportStatus"
import { useBlockAdAndResolveReport } from "@/hook/useBlockAdAndResolveReport"
import { useBanUserAndResolveReport } from "@/hook/useBanUserAndResolveReport"
import { useAdminMessage } from "@/hook/useAdminMessage"
import { cn } from "@/lib/utils"

const REPORT_REASON_LABELS: Record<string, string> = {
    [REPORT_REASON.SPAM]: "Спам або реклама",
    [REPORT_REASON.SCAM]: "Шахрайство",
    [REPORT_REASON.INAPPROPRIATE]: "Неприйнятний контент",
    [REPORT_REASON.ANIMAL_CRUELTY]: "Жорстоке поводження з тваринами",
    [REPORT_REASON.OTHER]: "Інша причина",
}

const TARGET_LABELS: Record<string, string> = {
    [REPORT_TARGET_TYPE.AD]: "Оголошення",
    [REPORT_TARGET_TYPE.USER]: "Користувач",
    [REPORT_TARGET_TYPE.MESSAGE]: "Повідомлення",
}

const STATUS_LABELS: Record<string, string> = {
    [REPORT_STATUS.PENDING]: "В обробці",
    [REPORT_STATUS.RESOLVED]: "Вирішено",
    [REPORT_STATUS.DISMISSED]: "Відхилено",
}

interface Props {
    reportId: string | null
    selectedReport: EnrichedReport | null
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function ReportReviewSheet({ reportId, selectedReport, isOpen, onOpenChange }: Props) {
    const { data: fetchedReport, isLoading: isFetching } = useReport(reportId, !!reportId && selectedReport === null)

    const { mutateAsync: updateReportStatus, isPending: isUpdatingStatus } = useUpdateReportStatus()
    const { mutateAsync: blockAdAndResolve, isPending: isBlockingAd } = useBlockAdAndResolveReport()
    const { mutateAsync: banUserAndResolve, isPending: isBanningUser } = useBanUserAndResolveReport() // <--- ДОДАНО

    const [adminNotes, setAdminNotes] = useState("")
    const sanitizedNotes = adminNotes.trim() || undefined

    const isAnyActionLoading = isUpdatingStatus || isBlockingAd || isBanningUser

    const report = selectedReport || fetchedReport

    const isMessageReport = report?.targetType === REPORT_TARGET_TYPE.MESSAGE
    const isUserReport = report?.targetType === REPORT_TARGET_TYPE.USER
    const isAdReport = report?.targetType === REPORT_TARGET_TYPE.AD

    const isPendingStatus = report?.status === REPORT_STATUS.PENDING

    const { data: messageData, isLoading: isMessageLoading } = useAdminMessage(
        isMessageReport && report ? report.targetId : null
    )

    let targetUserIdToBan: string | null = null;
    if (isUserReport && report) targetUserIdToBan = report.targetId;
    if (isMessageReport && messageData) targetUserIdToBan = messageData.senderId;

    useEffect(() => {
        if (isOpen && report) {
            setAdminNotes(report.adminNotes || "")
        }
    }, [isOpen, report?.id])

    if (!isOpen) return null

    if (isFetching && !report) {
        return (
            <Sheet open={isOpen} onOpenChange={onOpenChange}>
                <SheetContent side="right" className="flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </SheetContent>
            </Sheet>
        )
    }

    if (!report) return null

    const handleDismiss = async () => {
        try {
            await updateReportStatus({
                id: report.id,
                data: { status: REPORT_STATUS.DISMISSED, adminNotes: sanitizedNotes }
            })
            toast.success("Скаргу відхилено")
            onOpenChange(false)
        } catch (error) {
            toast.error("Не вдалося відхилити скаргу")
        }
    }

    const handleResolveOnly = async () => {
        try {
            await updateReportStatus({
                id: report.id,
                data: { status: REPORT_STATUS.RESOLVED, adminNotes: sanitizedNotes }
            })
            toast.success("Скаргу закрито як вирішену")
            onOpenChange(false)
        } catch (error) {
            toast.error("Не вдалося оновити скаргу")
        }
    }

    const handleBlockAndResolve = async () => {
        try {
            await blockAdAndResolve({
                reportId: report.id,
                data: { adId: report.targetId, adminNotes: sanitizedNotes }
            })
            toast.success("Оголошення заблоковано, скаргу закрито")
            onOpenChange(false)
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 404) {
                toast.warning("Оголошення не знайдено. Можливо, автор вже видалив його.", { duration: 5000 })
            } else {
                toast.error("Сталася помилка при блокуванні та закритті скарги")
            }
        }
    }

    const handleBanUserAndResolve = async () => {
        if (!targetUserIdToBan) return;
        try {
            await banUserAndResolve({
                reportId: report.id,
                data: { targetUserId: targetUserIdToBan, adminNotes: sanitizedNotes }
            })
            toast.success("Акаунт заблоковано назавжди, скаргу закрито")
            onOpenChange(false)
        } catch (error) {
            toast.error("Сталася помилка при блокуванні користувача")
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md md:max-w-xl p-0 bg-gray-50 flex flex-col sm:max-w-none">
                <div className="flex-1 overflow-y-auto custom-scrollbar">

                    {/* Хедер */}
                    <div className="bg-white p-6 sm:p-8 border-b border-gray-100">
                        <SheetHeader className="mb-4">
                            <div className="flex items-center gap-3 mb-2">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                    report.status === REPORT_STATUS.PENDING && "bg-amber-100 text-amber-700",
                                    report.status === REPORT_STATUS.RESOLVED && "bg-emerald-100 text-emerald-700",
                                    report.status === REPORT_STATUS.DISMISSED && "bg-gray-100 text-gray-600"
                                )}>
                                    {STATUS_LABELS[report.status] || report.status}
                                </span>
                            </div>
                            <SheetTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <AlertTriangle className="h-6 w-6 text-red-500" /> Деталі скарги
                            </SheetTitle>
                            <SheetDescription>
                                Створено: {new Intl.DateTimeFormat("uk-UA", {
                                    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                                }).format(new Date(report.createdAt))}
                            </SheetDescription>
                        </SheetHeader>
                    </div>

                    <div className="p-6 sm:p-8 space-y-8">

                        {/* Причина та коментар */}
                        <section>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Суть скарги</h3>
                            <Card className="border-red-100 shadow-sm bg-red-50/30">
                                <CardContent className="p-5">
                                    <div className="font-bold text-red-900 text-lg mb-2">
                                        {REPORT_REASON_LABELS[report.reason] || report.reason}
                                    </div>
                                    {report.comment ? (
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap font-medium">
                                            "{report.comment}"
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">Коментар відсутній</p>
                                    )}
                                </CardContent>
                            </Card>
                        </section>

                        {/* Об'єкт скарги */}
                        <section>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Об'єкт скарги</h3>
                            <Card className="border-none shadow-sm">
                                <CardContent className="p-5 flex flex-col gap-4 bg-white">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                {isAdReport && <ExternalLink className="w-5 h-5 text-primary" />}
                                                {isUserReport && <User className="w-5 h-5 text-primary" />}
                                                {isMessageReport && <MessageSquare className="w-5 h-5 text-primary" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">
                                                    {TARGET_LABELS[report.targetType] || report.targetType}
                                                </p>
                                                <p className="text-xs text-gray-500 font-mono mt-0.5">{report.targetId}</p>
                                            </div>
                                        </div>

                                        {isAdReport && (
                                            <Button asChild variant="outline" size="sm">
                                                <a href={`/ads/${report.targetId}`} target="_blank" rel="noopener noreferrer">
                                                    Відкрити
                                                </a>
                                            </Button>
                                        )}
                                    </div>

                                    {/* Блок з текстом повідомлення */}
                                    {isMessageReport && (
                                        <div className="mt-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Текст повідомлення:</p>
                                            {isMessageLoading ? (
                                                <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                                                    <Loader2 className="w-4 h-4 animate-spin" /> Завантаження тексту...
                                                </div>
                                            ) : messageData ? (
                                                <p className="text-sm text-gray-800 font-medium whitespace-pre-wrap">
                                                    "{messageData.content}"
                                                </p>
                                            ) : (
                                                <p className="text-sm text-red-500 font-medium">
                                                    Повідомлення не знайдено або було видалено.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </section>

                        {/* Дані скаржника */}
                        <section>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Хто поскаржився</h3>
                            <Card className="border-none shadow-sm">
                                <CardContent className="p-5 space-y-4 bg-white">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                            <User className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Повне ім'я</p>
                                            <p className="font-bold text-gray-900">{report.reporter.firstName} {report.reporter.lastName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                            <MessageSquare className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Email</p>
                                            <a href={`mailto:${report.reporter.email}`} className="font-bold text-gray-900 hover:text-primary">
                                                {report.reporter.email}
                                            </a>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Нотатки адміна */}
                        <section>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                                Нотатки / Причина
                            </h3>
                            <Textarea
                                placeholder="Опишіть рішення або залиште повідомлення для автора..."
                                className="min-h-[120px] resize-none bg-white text-[15px]"
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                disabled={!isPendingStatus || isAnyActionLoading}
                            />
                        </section>
                    </div>
                </div>

                {/* Нижня панель дій */}
                {isPendingStatus && (
                    <div className="p-6 bg-white border-t border-gray-100 flex flex-col gap-3 shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-10">
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 text-gray-600 hover:bg-gray-100 h-12"
                                onClick={handleDismiss}
                                disabled={isAnyActionLoading}
                            >
                                <X className="w-4 h-4 mr-2" /> Відхилити (Ігнорувати)
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50 h-12"
                                onClick={handleResolveOnly}
                                disabled={isAnyActionLoading}
                            >
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Вирішено (Залишити попередження)
                            </Button>
                        </div>

                        {/* Дії залежно від типу скарги */}
                        {isAdReport && (
                            <Button
                                className="w-full bg-red-500 hover:bg-red-600 text-white shadow-sm h-12 text-base"
                                onClick={handleBlockAndResolve}
                                disabled={isAnyActionLoading}
                            >
                                {isBlockingAd ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Ban className="w-5 h-5 mr-2" />}
                                Заблокувати оголошення та закрити скаргу
                            </Button>
                        )}

                        {(isUserReport || isMessageReport) && (
                            <Button
                                className="w-full bg-red-600 hover:bg-red-700 text-white shadow-sm h-12 text-base"
                                onClick={handleBanUserAndResolve}
                                disabled={isAnyActionLoading || !targetUserIdToBan}
                            >
                                {isBanningUser ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <UserMinus className="w-5 h-5 mr-2" />}
                                Заблокувати акаунт та закрити скаргу
                            </Button>
                        )}
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
