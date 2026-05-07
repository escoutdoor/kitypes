"use client"

import { FileText, Clock, CheckCircle2, XCircle, AlertOctagon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { MyVerificationItem, VerificationStatus } from "@/service/verification/verification.interface"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<VerificationStatus, { label: string; icon: any; colorClass: string; bgClass: string }> = {
    pending: {
        label: "В обробці",
        icon: Clock,
        colorClass: "text-amber-600",
        bgClass: "bg-amber-50 border-amber-200",
    },
    approved: {
        label: "Схвалено",
        icon: CheckCircle2,
        colorClass: "text-emerald-600",
        bgClass: "bg-emerald-50 border-emerald-200",
    },
    rejected: {
        label: "Відхилено",
        icon: XCircle,
        colorClass: "text-red-600",
        bgClass: "bg-red-50 border-red-200",
    },
}

const ROLE_LABELS = {
    volunteer: "Волонтер",
    shelter: "Притулок",
    user: "Користувач",
    admin: "Адміністратор",
}

export function VerificationCard({ item }: { item: MyVerificationItem }) {
    const config = STATUS_CONFIG[item.status]
    const StatusIcon = config.icon

    return (
        <Card className="border-gray-200 shadow-sm overflow-hidden bg-white">
            <CardContent className="p-0">
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-b border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">
                            {new Intl.DateTimeFormat("uk-UA", {
                                day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                            }).format(new Date(item.createdAt))}
                        </p>
                        <h3 className="text-lg font-bold text-gray-900">
                            Заявка на статус: <span className="text-primary">{ROLE_LABELS[item.requestedRole]}</span>
                        </h3>
                    </div>
                    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm font-semibold text-sm shrink-0", config.bgClass, config.colorClass)}>
                        <StatusIcon className="w-4 h-4" />
                        {config.label}
                    </div>
                </div>

                <div className="p-5 sm:p-6 space-y-6">
                    {item.status === "rejected" && item.adminNotes && (
                        <div className="bg-red-50/80 border border-red-100 p-4 rounded-2xl flex gap-3">
                            <AlertOctagon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-red-900 text-[14px] mb-1">Причина відмови</h4>
                                <p className="text-[13px] text-red-800 font-medium leading-relaxed whitespace-pre-wrap">
                                    {item.adminNotes}
                                </p>
                            </div>
                        </div>
                    )}

                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            Прикріплені документи ({item.documentUrls?.length || 0})
                        </h4>
                        {item.documentUrls && item.documentUrls.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {item.documentUrls.map((url, idx) => (
                                    <a
                                        key={idx}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-primary/5 border border-gray-200 hover:border-primary/30 text-sm font-medium text-gray-700 hover:text-primary rounded-xl transition-colors cursor-pointer"
                                    >
                                        <FileText className="w-4 h-4 shrink-0" />
                                        <span>Документ {idx + 1}</span>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Документи відсутні</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
