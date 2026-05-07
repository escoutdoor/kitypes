"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Upload, FileText, X, Loader2, Heart, Home, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { isAxiosError } from "axios"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { cn } from "@/lib/utils"

import { S3Service } from "@/lib/s3"
import { VerificationService } from "@/service/verification/verification.service"
import { useCreateVerification } from "@/hook/useCreateVerification"
import { useProfile } from "@/hook/useProfile"

import {
    ALLOWED_DOC_TYPES,
    CreateVerificationFormValues,
    createVerificationSchema,
    DOC_MIME_TO_EXT,
    MAX_DOCS,
    MAX_DOC_SIZE_BYTES
} from "./model"

type Props = {
    onSuccessAction?: () => void
}

export function CreateVerificationForm({ onSuccessAction }: Props) {
    const { mutateAsync: createVerification } = useCreateVerification()
    const { user } = useProfile()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { control, handleSubmit, setValue, watch, formState: { isValid } } = useForm<CreateVerificationFormValues>({
        resolver: zodResolver(createVerificationSchema),
        defaultValues: {
            requestedRole: undefined,
            documents: [],
        },
        mode: "onChange",
    })

    const documents = watch("documents")

    const isAlreadyVolunteer = user?.role === "volunteer"
    const isAlreadyShelter = user?.role === "shelter"

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (!files.length) return

        const validFiles: File[] = []
        for (const file of files) {
            if (!ALLOWED_DOC_TYPES.includes(file.type as any)) {
                toast.error(`Файл "${file.name}" має недопустимий формат.`)
                continue
            }
            if (file.size > MAX_DOC_SIZE_BYTES) {
                toast.error(`Файл "${file.name}" занадто великий (макс. 5MB).`)
                continue
            }
            validFiles.push(file)
        }

        const currentDocs = watch("documents")
        const availableSlots = MAX_DOCS - currentDocs.length

        if (validFiles.length > availableSlots) {
            toast.warning(`Додано лише ${availableSlots} файлів. Максимальний ліміт — ${MAX_DOCS}.`)
        }

        const newDocs = [...currentDocs, ...validFiles.slice(0, availableSlots)]
        setValue("documents", newDocs, { shouldValidate: true, shouldDirty: true })
        e.target.value = ""
    }

    const removeDocument = (index: number) => {
        const newDocs = [...documents]
        newDocs.splice(index, 1)
        setValue("documents", newDocs, { shouldValidate: true, shouldDirty: true })
    }

    const onSubmit = async (data: CreateVerificationFormValues) => {
        try {
            setIsSubmitting(true)

            const extensions = data.documents.map(f => DOC_MIME_TO_EXT[f.type] || ".pdf")
            const uploadMeta = await VerificationService.getUploadUrls({ extensions })

            if (uploadMeta.targets.length !== data.documents.length) {
                throw new Error("Невідповідність кількості файлів при генерації лінків")
            }

            await Promise.all(
                uploadMeta.targets.map((target, idx) =>
                    S3Service.uploadFile(target.uploadUrl, data.documents[idx])
                )
            )

            const documentKeys = uploadMeta.targets.map(t => t.documentKey)
            await createVerification({
                requestedRole: data.requestedRole,
                documentKeys,
            })

            toast.success("Заявку успішно відправлено на перевірку! 🎉")
            onSuccessAction?.()

        } catch (error) {
            console.error("Verification submit error:", error)

            if (isAxiosError(error)) {
                const status = error.response?.status
                const message = (error.response?.data as any)?.message?.toLowerCase() || ""

                if (status === 409) {
                    if (message.includes("already been sent")) {
                        toast.error("Ви вже подали заявку. Будь ласка, очікуйте рішення адміністратора.")
                        return
                    }

                    if (message.includes("already verified")) {
                        toast.error("Ви вже верифіковані за цим статусом!")
                        return
                    }
                }

                if (status === 403 && message.includes("72 hours")) {
                    toast.error("Ви зможете подати нову заявку лише через 72 години після попередньої відмови.")
                    return
                }
            }

            toast.error("Не вдалося відправити заявку. Спробуйте ще раз.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <Controller
                name="requestedRole"
                control={control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel className="text-base font-semibold text-gray-900 mb-3">
                            Який статус ви хочете отримати?
                        </FieldLabel>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className={cn(
                                "relative flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 text-center",
                                isAlreadyVolunteer
                                    ? "border-blue-200 bg-blue-50/40 cursor-not-allowed"
                                    : field.value === "volunteer"
                                        ? "border-blue-500 bg-blue-50/50 text-blue-700 shadow-sm cursor-pointer"
                                        : "border-gray-200 text-gray-500 hover:border-blue-300 hover:bg-gray-50 cursor-pointer"
                            )}>
                                {isAlreadyVolunteer && (
                                    <div className="absolute top-3 right-3 flex items-center gap-1.5 text-[11px] font-bold text-white bg-blue-500 border border-blue-600 shadow-sm px-2.5 py-1 rounded-md z-10">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Отримано
                                    </div>
                                )}
                                <input
                                    type="radio"
                                    className="hidden"
                                    value="volunteer"
                                    checked={field.value === "volunteer"}
                                    onChange={() => !isAlreadyVolunteer && field.onChange("volunteer")}
                                    disabled={isSubmitting || isAlreadyVolunteer}
                                />
                                <div className={cn("p-3 rounded-full transition-opacity", field.value === "volunteer" || isAlreadyVolunteer ? "bg-blue-100 text-blue-600" : "bg-gray-100", isAlreadyVolunteer && "opacity-50 grayscale")}>
                                    <Heart className="h-6 w-6" />
                                </div>
                                <div className={cn("transition-opacity", isAlreadyVolunteer && "opacity-50")}>
                                    <span className="font-bold text-base block mb-1">Волонтер</span>
                                    <span className="text-xs font-medium opacity-80">Допомагаю тваринам самостійно</span>
                                </div>
                            </label>

                            <label className={cn(
                                "relative flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 text-center",
                                isAlreadyShelter
                                    ? "border-emerald-200 bg-emerald-50/40 cursor-not-allowed"
                                    : field.value === "shelter"
                                        ? "border-emerald-500 bg-emerald-50/50 text-emerald-700 shadow-sm cursor-pointer"
                                        : "border-gray-200 text-gray-500 hover:border-emerald-300 hover:bg-gray-50 cursor-pointer"
                            )}>
                                {isAlreadyShelter && (
                                    <div className="absolute top-3 right-3 flex items-center gap-1.5 text-[11px] font-bold text-white bg-emerald-500 border border-emerald-600 shadow-sm px-2.5 py-1 rounded-md z-10">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Отримано
                                    </div>
                                )}
                                <input
                                    type="radio"
                                    className="hidden"
                                    value="shelter"
                                    checked={field.value === "shelter"}
                                    onChange={() => !isAlreadyShelter && field.onChange("shelter")}
                                    disabled={isSubmitting || isAlreadyShelter}
                                />
                                <div className={cn("p-3 rounded-full transition-opacity", field.value === "shelter" || isAlreadyShelter ? "bg-emerald-100 text-emerald-600" : "bg-gray-100", isAlreadyShelter && "opacity-50 grayscale")}>
                                    <Home className="h-6 w-6" />
                                </div>
                                <div className={cn("transition-opacity", isAlreadyShelter && "opacity-50")}>
                                    <span className="font-bold text-base block mb-1">Притулок</span>
                                    <span className="text-xs font-medium opacity-80">Офіційна організація / фонд</span>
                                </div>
                            </label>
                        </div>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} className="mt-2" />}
                    </Field>
                )}
            />

            <Controller
                name="documents"
                control={control}
                render={({ fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel className="text-base font-semibold text-gray-900 mb-3">
                            Підтверджуючі документи
                        </FieldLabel>
                        <p className="text-[13px] text-muted-foreground mb-4 leading-relaxed">
                            Завантажте фото паспорта (для волонтерів) або реєстраційні документи (для притулків).
                            Дані надійно захищені і не передаються третім особам.
                        </p>

                        <label className={cn(
                            "min-h-[140px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-muted-foreground bg-gray-50/50 transition-colors p-6 text-center mb-4",
                            isSubmitting ? "opacity-50 pointer-events-none" : "cursor-pointer hover:border-primary/50 hover:bg-primary/5"
                        )}>
                            <Upload className="h-7 w-7 mb-3 text-gray-400" />
                            <span className="font-bold text-gray-700 text-sm mb-1">Натисніть для вибору файлів</span>
                            <span className="text-xs font-medium">PDF, JPG, PNG • до 5MB • {documents.length}/{MAX_DOCS}</span>
                            <input
                                type="file"
                                accept={ALLOWED_DOC_TYPES.join(",")}
                                multiple
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={isSubmitting}
                            />
                        </label>

                        {documents.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                {documents.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-white shadow-sm group">
                                        <div className="flex items-center gap-3 overflow-hidden pr-3">
                                            <div className="p-2 bg-primary/10 rounded-lg shrink-0 text-primary">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div className="truncate">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{file.name}</p>
                                                <p className="text-[11px] font-medium text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeDocument(idx)}
                                            disabled={isSubmitting}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} className="mt-2" />}
                    </Field>
                )}
            />

            <div className="pt-4">
                <Button
                    type="submit"
                    size="lg"
                    className="w-full text-base font-bold shadow-md rounded-xl"
                    disabled={!isValid || isSubmitting || documents.length === 0}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Відправляємо...
                        </>
                    ) : (
                        "Відправити заявку"
                    )}
                </Button>
            </div>
        </form>
    )
}
