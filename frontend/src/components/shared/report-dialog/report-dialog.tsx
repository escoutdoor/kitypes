"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Flag, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { isAxiosError } from "axios"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"

import { useAuthStore } from "@/store/auth.store"
import { useCreateReport } from "@/hook/useCreateReport"
import { REPORT_REASON, ReportReason, ReportTargetType } from "@/service/report/report.interface"
import { cn } from "@/lib/utils"

const REPORT_REASON_LABELS: Record<ReportReason, string> = {
    [REPORT_REASON.SPAM]: "Спам або реклама",
    [REPORT_REASON.SCAM]: "Шахрайство",
    [REPORT_REASON.INAPPROPRIATE]: "Неприйнятний контент",
    [REPORT_REASON.ANIMAL_CRUELTY]: "Жорстоке поводження з тваринами",
    [REPORT_REASON.OTHER]: "Інше",
}

const reportSchema = z.object({
    reason: z.enum([
        REPORT_REASON.SPAM,
        REPORT_REASON.SCAM,
        REPORT_REASON.INAPPROPRIATE,
        REPORT_REASON.ANIMAL_CRUELTY,
        REPORT_REASON.OTHER
    ], { message: "Оберіть причину скарги" }),
    comment: z.string().max(500, "Максимум 500 символів").optional(),
}).refine((data) => {
    if (data.reason === REPORT_REASON.OTHER) {
        return data.comment && data.comment.trim().length >= 10;
    }
    return true;
}, {
    message: "Коментар обов'язковий (мінімум 10 символів)",
    path: ["comment"],
});

type ReportFormValues = z.infer<typeof reportSchema>

interface Props {
    targetType: ReportTargetType
    targetId: string
    variant?: "default" | "outline" | "ghost"
    className?: string
    iconOnly?: boolean
}

export function ReportDialog({ targetType, targetId, variant = "ghost", className, iconOnly }: Props) {
    const router = useRouter()
    const { isAuthenticated } = useAuthStore()
    const { mutateAsync: createReport, isPending } = useCreateReport()

    const [isOpen, setIsOpen] = useState(false)

    const { control, handleSubmit, reset, watch } = useForm<ReportFormValues>({
        resolver: zodResolver(reportSchema),
        defaultValues: { comment: "" },
    })

    const selectedReason = watch("reason")

    const handleOpenClick = (e: React.MouseEvent) => {
        e.preventDefault()
        if (!isAuthenticated) {
            toast.info("Потрібна авторизація", {
                description: "Увійдіть в акаунт, щоб мати можливість відправити скаргу.",
                action: { label: "Увійти", onClick: () => router.push("/login") },
            })
            return
        }
        setIsOpen(true)
    }

    const onOpenChange = (open: boolean) => {
        if (!open) reset()
        setIsOpen(open)
    }

    const onSubmit = async (data: ReportFormValues) => {
        try {
            await createReport({
                targetType,
                targetId,
                reason: data.reason,
                comment: data.comment?.trim() || undefined,
            })
            toast.success("Скаргу успішно надіслано. Дякуємо за пильність!")
            onOpenChange(false)
        } catch (error) {
            if (isAxiosError(error) && error.response) {
                if (error.response.status === 409) {
                    toast.error("Ви вже відправляли скаргу на цей об'єкт.")
                    onOpenChange(false)
                    return
                }
                if (error.response.status === 429) {
                    toast.error("Перевищено ліміт скарг. Спробуйте пізніше.")
                    onOpenChange(false)
                    return
                }
            }
            toast.error("Не вдалося відправити скаргу. Спробуйте ще раз.")
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant={variant}
                    size={iconOnly ? "icon" : "sm"}
                    className={cn("text-gray-500 hover:text-red-600 hover:bg-red-50 cursor-pointer", className)}
                    onClick={handleOpenClick}
                    title={iconOnly ? "Поскаржитись" : undefined}
                >
                    <Flag className={cn("h-4 w-4", !iconOnly && "mr-2")} />
                    {!iconOnly && "Поскаржитись"}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Поскаржитись</DialogTitle>
                    <DialogDescription>
                        Допоможіть нам зберегти безпечне середовище. Ваша скарга буде перевірена модераторами.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
                    <Controller
                        name="reason"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>Причина скарги</FieldLabel>
                                <div className="grid gap-2 mt-2">
                                    {Object.values(REPORT_REASON).map((reason) => (
                                        <label
                                            key={reason}
                                            className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${field.value === reason
                                                ? "border-red-500 bg-red-50 text-red-900"
                                                : "border-gray-200 hover:border-red-200 hover:bg-gray-50 text-gray-700"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                className="hidden"
                                                value={reason}
                                                checked={field.value === reason}
                                                onChange={() => field.onChange(reason)}
                                            />
                                            <span className="text-sm font-medium">{REPORT_REASON_LABELS[reason]}</span>
                                        </label>
                                    ))}
                                </div>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

                    <Controller
                        name="comment"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>
                                    Додатковий коментар
                                    {selectedReason === REPORT_REASON.OTHER ? (
                                        <span className="text-red-500 ml-1">*</span>
                                    ) : (
                                        <span className="text-gray-400 font-normal ml-1">(необов'язково)</span>
                                    )}
                                </FieldLabel>
                                <Textarea
                                    placeholder="Опишіть проблему детальніше..."
                                    className="resize-none h-24 mt-2 bg-gray-50/50"
                                    disabled={isPending}
                                    {...field}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
                            Скасувати
                        </Button>
                        <Button type="submit" disabled={isPending} className="bg-red-500 hover:bg-red-600 text-white cursor-pointer px-6">
                            {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Flag className="h-4 w-4 mr-2" />}
                            Надіслати
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
