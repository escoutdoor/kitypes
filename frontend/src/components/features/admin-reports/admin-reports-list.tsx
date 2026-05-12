"use client"

import { useState } from "react"
import { Clock, CheckCircle2, XCircle, Inbox, ShieldAlert, Filter } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { PaginationBar } from "@/components/shared/pagination-bar/pagination-bar"

import { useReports } from "@/hook/useReports"
import { REPORT_STATUS, REPORT_TARGET_TYPE, ReportStatus, ReportTargetType, EnrichedReport } from "@/service/report/report.interface"
import { ReportReviewSheet } from "./report-review-sheet"
import { cn } from "@/lib/utils"

const LIMIT = 15

type FilterStatus = ReportStatus | "all"
type FilterTarget = ReportTargetType | "all"

const STATUS_TABS = [
    { label: "В обробці", value: REPORT_STATUS.PENDING, icon: Clock },
    { label: "Вирішені", value: REPORT_STATUS.RESOLVED, icon: CheckCircle2 },
    { label: "Відхилені", value: REPORT_STATUS.DISMISSED, icon: XCircle },
    { label: "Всі", value: "all", icon: Inbox },
] as const

const TARGET_LABELS: Record<string, string> = {
    [REPORT_TARGET_TYPE.AD]: "Оголошення",
    [REPORT_TARGET_TYPE.USER]: "Користувач",
    [REPORT_TARGET_TYPE.MESSAGE]: "Повідомлення",
}

const STATUS_LABELS: Record<string, string> = {
    pending: "В обробці",
    resolved: "Вирішено",
    dismissed: "Відхилено",
};

export function AdminReportsList() {
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState<FilterStatus>(REPORT_STATUS.PENDING)
    const [targetTypeFilter, setTargetTypeFilter] = useState<FilterTarget>("all") // НОВИЙ СТАН ДЛЯ ФІЛЬТРУ

    const [selectedReport, setSelectedReport] = useState<EnrichedReport | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    const { data, isLoading } = useReports({
        limit: LIMIT,
        offset: (page - 1) * LIMIT,
        status: statusFilter === "all" ? undefined : statusFilter,
        targetType: targetTypeFilter === "all" ? undefined : targetTypeFilter,
    })

    const reports = data?.reports || []
    const total = data?.total || 0
    const totalPages = Math.max(1, Math.ceil(total / LIMIT))

    const handleRowClick = (req: EnrichedReport) => {
        setSelectedReport(req)
        setIsSheetOpen(true)
    }

    const handleStatusChange = (value: string) => {
        setStatusFilter(value as FilterStatus)
        setPage(1)
    }

    const handleTargetTypeChange = (value: string) => {
        setTargetTypeFilter(value as FilterTarget)
        setPage(1)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <Tabs value={statusFilter} onValueChange={handleStatusChange} className="w-full sm:w-auto">
                    <TabsList className="bg-white border border-gray-200 shadow-sm h-11 p-1">
                        {STATUS_TABS.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="flex items-center gap-2 px-4 rounded-md data-[state=active]:bg-primary data-[state=active]:text-white transition-all cursor-pointer"
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </TabsTrigger>
                            )
                        })}
                    </TabsList>
                </Tabs>

                {/* ДОДАНО: Випадаючий список для фільтрації за типом об'єкта */}
                <div className="w-full sm:w-56">
                    <Select value={targetTypeFilter} onValueChange={handleTargetTypeChange}>
                        <SelectTrigger className="bg-white border-gray-200 shadow-sm h-11 cursor-pointer">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <SelectValue placeholder="Всі об'єкти" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="cursor-pointer">Всі об'єкти</SelectItem>
                            <SelectItem value={REPORT_TARGET_TYPE.AD} className="cursor-pointer">Тільки Оголошення</SelectItem>
                            <SelectItem value={REPORT_TARGET_TYPE.USER} className="cursor-pointer">Тільки Користувачі</SelectItem>
                            <SelectItem value={REPORT_TARGET_TYPE.MESSAGE} className="cursor-pointer">Тільки Повідомлення</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/80">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-bold text-gray-500 uppercase text-xs h-12 px-6 w-[200px]">Об'єкт</TableHead>
                            <TableHead className="font-bold text-gray-500 uppercase text-xs h-12 px-6">Скаржник</TableHead>
                            <TableHead className="font-bold text-gray-500 uppercase text-xs h-12 px-6">Дата</TableHead>
                            <TableHead className="font-bold text-gray-500 uppercase text-xs h-12 px-6">Статус</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-24 mb-2" /><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-32 mb-2" /><Skeleton className="h-4 w-40" /></TableCell>
                                    <TableCell className="px-6 py-4"><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                </TableRow>
                            ))
                        ) : reports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-gray-500 font-medium">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <ShieldAlert className="h-8 w-8 text-gray-300" />
                                        Скарг не знайдено
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            reports.map((report) => (
                                <TableRow
                                    key={report.id}
                                    className="cursor-pointer group hover:bg-gray-50/80 transition-colors"
                                    onClick={() => handleRowClick(report)}
                                >
                                    <TableCell className="px-6 py-4">
                                        <div className="font-semibold text-gray-900">{TARGET_LABELS[report.targetType] || report.targetType}</div>
                                        <div className="text-xs text-gray-500 font-mono mt-0.5" title={report.targetId}>
                                            {report.targetId.split('-')[0]}...
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                        <div className="font-semibold text-gray-900">
                                            {report.reporter.firstName} {report.reporter.lastName}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5">{report.reporter.email}</div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-gray-600 whitespace-nowrap text-sm">
                                        {new Intl.DateTimeFormat("uk-UA", {
                                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                                        }).format(new Date(report.createdAt))}
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider",
                                            report.status === REPORT_STATUS.PENDING && "bg-amber-100 text-amber-700",
                                            report.status === REPORT_STATUS.RESOLVED && "bg-emerald-100 text-emerald-700",
                                            report.status === REPORT_STATUS.DISMISSED && "bg-gray-100 text-gray-600"
                                        )}>
                                            {STATUS_LABELS[report.status] || report.status}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                        <PaginationBar page={page} totalPages={totalPages} onPageChangeAction={setPage} />
                    </div>
                )}
            </div>

            <ReportReviewSheet
                reportId={selectedReport?.id || null}
                selectedReport={selectedReport}
                isOpen={isSheetOpen}
                onOpenChange={setIsSheetOpen}
            />
        </div>
    )
}
