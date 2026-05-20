"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import {
    Pencil,
    Info,
    MapPin,
    Camera,
    Dog,
    Cat,
    Rabbit,
    Mars,
    Venus,
    Upload,
    X,
    Loader2,
    ArrowLeft,
    EyeOff,
    Eye,
    Trash2,
    Ban,
} from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { AdService } from "@/service/ad/ad.service"
import { S3Service } from "@/lib/s3"
import { useAd } from "@/hook/useAd"
import { useUpdateAd } from "@/hook/useUpdateAd"
import { useDeleteAd } from "@/hook/useDeleteAd"
import { useChangeAdStatus } from "@/hook/useChangeAdStatus"

import {
    ALLOWED_MIME_TYPES,
    editAdSchema,
    MAX_FILE_SIZE_BYTES,
    MAX_IMAGES,
    MIME_TO_EXT,
    type EditAdFormValues,
    type ImageItem,
} from "./model"
import { AD_STATUS } from "@/service/ad/ad.interface"

const PET_TYPES = [
    { value: 1, label: "Песик", icon: Dog },
    { value: 2, label: "Котик", icon: Cat },
    { value: 3, label: "Інше", icon: Rabbit },
] as const

const PET_GENDERS = [
    {
        value: 1,
        label: "Хлопчик",
        icon: Mars,
        activeClass: "border-blue-500 bg-blue-50 text-blue-700",
        idleClass: "border-gray-200 hover:border-blue-300 text-gray-600 hover:bg-gray-50",
    },
    {
        value: 2,
        label: "Дівчинка",
        icon: Venus,
        activeClass: "border-pink-500 bg-pink-50 text-pink-700",
        idleClass: "border-gray-200 hover:border-pink-300 text-gray-600 hover:bg-gray-50",
    },
] as const

type InitialSnapshot = {
    title: string
    description: string
    petType: number
    petGender: number
    petAgeMonth: string
    petBreed: string
    country: string
    city: string
}

function normalizeText(v: string | undefined | null) {
    return (v ?? "").trim()
}

function normalizeAge(v: string | undefined | null) {
    return (v ?? "").trim()
}

function extractKeyFromImageUrl(url: string): string {
    if (!url) return ""
    try {
        const u = new URL(url)
        const parts = decodeURIComponent(u.pathname).split('/').filter(Boolean)

        if (parts.length >= 2 && parts[parts.length - 2] === "ads") {
            return `ads/${parts[parts.length - 1]}`
        }

        return parts[parts.length - 1]
    } catch {
        const parts = url.split('/').filter(Boolean)
        if (parts.length >= 2 && parts[parts.length - 2] === "ads") {
            return `ads/${parts[parts.length - 1]}`
        }
        return parts.pop() || url
    }
}

export function EditAd({ adId }: { adId: string }) {
    const router = useRouter()
    const queryClient = useQueryClient()

    const { data: ad, isLoading: isAdLoading, isError: isAdError } = useAd(adId)
    const { mutateAsync: updateAd } = useUpdateAd()
    const { mutate: deleteAd, isPending: isDeleting } = useDeleteAd()
    const { mutate: changeStatus, isPending: isChangingStatus } = useChangeAdStatus()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [imagesTouched, setImagesTouched] = useState(false)
    const [initialSnapshot, setInitialSnapshot] = useState<InitialSnapshot | null>(null)

    const isActive = ad?.status === 1
    const isAnyActionLoading = isSubmitting || isDeleting || isChangingStatus || isAdLoading

    const {
        control,
        handleSubmit,
        setValue,
        trigger,
        reset,
        formState: { errors, },
    } = useForm<EditAdFormValues>({
        resolver: zodResolver(editAdSchema),
        mode: "onSubmit",
        defaultValues: {
            title: "",
            description: "",
            petType: 0,
            petGender: 0,
            petAgeMonth: "",
            petBreed: "",
            country: "",
            city: "",
            images: [],
        },
    })

    const watched = useWatch({ control })
    const images: ImageItem[] = (watched.images ?? []) as ImageItem[]

    const isActuallyChanged = useMemo(() => {
        if (!initialSnapshot) return false

        const current = {
            title: normalizeText(watched.title),
            description: normalizeText(watched.description),
            petType: Number(watched.petType || 0),
            petGender: Number(watched.petGender || 0),
            petAgeMonth: normalizeAge(watched.petAgeMonth),
            petBreed: normalizeText(watched.petBreed),
            country: normalizeText(watched.country),
            city: normalizeText(watched.city),
        }

        return (
            imagesTouched || // Якщо картинки змінилися - форма точно змінена
            current.title !== initialSnapshot.title ||
            current.description !== initialSnapshot.description ||
            current.petType !== initialSnapshot.petType ||
            current.petGender !== initialSnapshot.petGender ||
            current.petAgeMonth !== initialSnapshot.petAgeMonth ||
            current.petBreed !== initialSnapshot.petBreed ||
            current.country !== initialSnapshot.country ||
            current.city !== initialSnapshot.city
        )
    }, [watched, imagesTouched, initialSnapshot])

    const canSubmit = !isAnyActionLoading && isActuallyChanged
    const imagesCountText = useMemo(() => `${images.length}/${MAX_IMAGES}`, [images])

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isActuallyChanged && !isSubmitting) {
                e.preventDefault()
            }
        }
        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [isActuallyChanged, isSubmitting])

    useEffect(() => {
        if (!ad) return

        const existingImages: Extract<ImageItem, { kind: "existing" }>[] = (ad.imageUrls ?? []).map((url) => ({
            kind: "existing",
            key: extractKeyFromImageUrl(url),
            previewUrl: url,
        }))

        reset({
            title: ad.title || "",
            description: ad.description || "",
            petType: ad.petType,
            petGender: ad.petGender,
            petAgeMonth: ad.petAgeMonth !== undefined && ad.petAgeMonth !== null ? String(ad.petAgeMonth) : "",
            petBreed: ad.petBreed || "",
            country: ad.country || "",
            city: ad.city || "",
            images: existingImages,
        })

        setInitialSnapshot({
            title: normalizeText(ad.title),
            description: normalizeText(ad.description),
            petType: Number(ad.petType),
            petGender: Number(ad.petGender),
            petAgeMonth: ad.petAgeMonth !== undefined && ad.petAgeMonth !== null ? String(ad.petAgeMonth) : "",
            petBreed: normalizeText(ad.petBreed),
            country: normalizeText(ad.country),
            city: normalizeText(ad.city),
        })

        setImagesTouched(false)
    }, [ad, reset])

    useEffect(() => {
        return () => {
            images.forEach((item) => {
                if (item.kind === "new" && item.previewUrl) {
                    URL.revokeObjectURL(item.previewUrl)
                }
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const validateSelectedFiles = (files: File[]): string | null => {
        if (!files.length) return null
        for (const file of files) {
            if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
                return `Файл "${file.name}" має невалідний формат.`
            }
            if (file.size > MAX_FILE_SIZE_BYTES) {
                return `Файл "${file.name}" завеликий. Максимум 5MB.`
            }
        }
        return null
    }

    const handleAddImages = (list: FileList | null) => {
        if (!list || isAnyActionLoading) return

        const picked = Array.from(list)
        const filesError = validateSelectedFiles(picked)
        if (filesError) {
            toast.error(filesError)
            return
        }

        const remainingSlots = MAX_IMAGES - images.length
        if (picked.length > remainingSlots) {
            toast.warning(`Додано лише ${remainingSlots} фото. Максимальний ліміт — ${MAX_IMAGES}.`)
        }

        const newItems: ImageItem[] = picked.slice(0, remainingSlots).map((file) => ({
            kind: "new",
            file,
            previewUrl: URL.createObjectURL(file),
        }))

        setImagesTouched(true)
        const merged: ImageItem[] = [...images, ...newItems]
        setValue("images", merged, { shouldValidate: true, shouldDirty: true })
    }

    const handleRemoveImage = (index: number) => {
        if (isAnyActionLoading) return

        const current: ImageItem[] = [...images]
        const [removed] = current.splice(index, 1)

        if (removed?.kind === "new" && removed.previewUrl) {
            URL.revokeObjectURL(removed.previewUrl)
        }

        setImagesTouched(true)
        setValue("images", current, { shouldValidate: true, shouldDirty: true })
        trigger("images")
    }

    const handleMakeMain = (index: number) => {
        if (index === 0 || isAnyActionLoading) return

        const current: ImageItem[] = [...images]
        const [selected] = current.splice(index, 1)
        if (!selected) return

        current.unshift(selected)
        setImagesTouched(true)
        setValue("images", current, { shouldValidate: true, shouldDirty: true })
    }

    const handleCancelClick = () => {
        if (isActuallyChanged) setShowCancelDialog(true)
        else router.back()
    }

    const handleDelete = () => {
        deleteAd(adId, {
            onSuccess: () => {
                toast.success("Оголошення успішно видалено")
                setInitialSnapshot(null)
                router.push("/my-ads")
            },
            onError: () => toast.error("Не вдалося видалити оголошення"),
        })
    }

    const handleStatusChange = () => {
        const newStatus = isActive ? 2 : 1
        changeStatus(
            { id: adId, status: newStatus },
            {
                onSuccess: () => {
                    toast.success(isActive ? "Оголошення переміщено в архів" : "Оголошення активовано")
                    queryClient.invalidateQueries({ queryKey: ["ad", adId] })
                },
                onError: () => toast.error("Не вдалося змінити статус"),
            }
        )
    }

    const onSubmit = async (data: EditAdFormValues) => {
        if (!isActuallyChanged) {
            toast.message("Немає змін для збереження")
            return
        }

        try {
            setIsSubmitting(true)

            let finalImageKeys: string[] | undefined = undefined

            if (imagesTouched) {
                const newItems = data.images.filter((img): img is Extract<ImageItem, { kind: "new" }> => img.kind === "new")
                let uploadedKeysInOrder: string[] = []

                if (newItems.length > 0) {
                    const uploadMeta = await AdService.getUploadUrls({
                        files: newItems.map((item) => ({ ext: MIME_TO_EXT[item.file.type] || ".jpg" })),
                    })

                    await Promise.all(
                        uploadMeta.items.map((item, idx) => S3Service.uploadFile(item.uploadUrl, newItems[idx].file))
                    )

                    uploadedKeysInOrder = uploadMeta.items.map((item) => item.imageKey)

                    if (uploadedKeysInOrder.length !== newItems.length) {
                        toast.error("Помилка завантаження фотографій: невідповідність кількості файлів.")
                        return
                    }
                }

                let uploadedCursor = 0
                finalImageKeys = data.images.map((item) => {
                    if (item.kind === "existing") return item.key // Наш чистий ключ без бакета
                    const key = uploadedKeysInOrder[uploadedCursor]
                    uploadedCursor += 1
                    return key
                })

                const invalid = finalImageKeys.some((k) => !k?.trim())
                if (invalid || finalImageKeys.length !== data.images.length) {
                    toast.error("Помилка обробки фотографій. Спробуйте ще раз.")
                    return
                }
            }

            const payload: any = {
                title: data.title.trim(),
                description: data.description.trim(),
                petType: data.petType,
                petGender: data.petGender,
                petAgeMonth: data.petAgeMonth?.trim() ? Number(data.petAgeMonth) : undefined,
                petBreed: data.petBreed?.trim() ? data.petBreed.trim() : undefined,
                country: data.country.trim(),
                city: data.city.trim(),
            }

            if (imagesTouched && finalImageKeys) {
                payload.imageKeys = finalImageKeys
            }

            await updateAd({
                id: adId,
                data: payload,
            })


            console.log("finalImageKeys:", finalImageKeys)
            console.log("images:", data.images)

            toast.success("Оголошення успішно оновлено!")
            setInitialSnapshot(null)
            router.push("/my-ads")
        } catch (error) {
            console.error(error)
            toast.error("Не вдалося оновити оголошення. Спробуйте ще раз.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isAdLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-muted-foreground gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p>Завантажуємо дані...</p>
            </div>
        )
    }

    if (isAdError || !ad) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <div className="p-4 bg-red-50 text-red-500 rounded-full mb-4">
                    <X className="h-10 w-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Оголошення не знайдено</h2>
                <p className="text-muted-foreground mb-6">
                    Можливо, воно було видалено або у вас немає до нього доступу.
                </p>
                <Button onClick={() => router.push("/my-ads")}>Повернутися до списку</Button>
            </div>
        )
    }

    if (ad && ad.status === AD_STATUS.BLOCKED) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <div className="p-4 bg-red-50 text-red-500 rounded-full mb-4">
                    <Ban className="h-10 w-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Редагування заборонено</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Це оголошення було заблоковано модератором. Ви не можете його редагувати або змінити статус.
                </p>
                <Button onClick={() => router.push("/my-ads")}>Повернутися до списку</Button>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 md:px-0 animate-in fade-in duration-500 pb-32">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <div className="inline-flex items-center justify-center p-3.5 bg-primary/10 rounded-full">
                        <Pencil className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Редагування</h1>
                        <div className="mt-1.5 flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold text-white shadow-sm ${isActive ? "bg-green-500" : "bg-gray-500"}`}>
                                {isActive ? "Активне" : "В архіві"}
                            </span>
                            <span className="text-sm text-muted-foreground line-clamp-1">{ad.title}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                        variant="secondary"
                        type="button"
                        onClick={handleStatusChange}
                        disabled={isAnyActionLoading}
                        className={`flex-1 md:flex-none gap-2 shadow-sm ${!isActive && "bg-green-50 text-green-700 hover:bg-green-100"}`}
                    >
                        {isActive ? (
                            <>
                                <EyeOff className="h-4 w-4" /> В архів
                            </>
                        ) : (
                            <>
                                <Eye className="h-4 w-4" /> Активувати
                            </>
                        )}
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                type="button"
                                className="flex-1 md:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 gap-2 shadow-sm"
                                disabled={isAnyActionLoading}
                            >
                                <Trash2 className="h-4 w-4" /> Видалити
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Ви впевнені?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Це безповоротно видалить оголошення <span className="font-semibold text-gray-900">"{ad.title}"</span> та всі його фотографії.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isAnyActionLoading}>Скасувати</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} disabled={isAnyActionLoading} className="bg-red-500 hover:bg-red-600 text-white">
                                    Видалити
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <Card className={`border-gray-200/60 shadow-sm overflow-hidden rounded-3xl bg-gray-50/50 ${isAnyActionLoading ? "opacity-60 pointer-events-none" : ""}`}>
                    <CardHeader className="border-b border-gray-100 bg-white pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Camera className="h-5 w-5 text-primary" /> Фотографії
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Додайте від 1 до {MAX_IMAGES} якісних фотографій. Перше фото буде головним.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 bg-white space-y-4">
                        <label className="h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-gray-50/50 cursor-pointer hover:border-primary/50 transition">
                            <Upload className="h-6 w-6 mb-2" />
                            <span className="font-medium text-gray-700">Натисніть, щоб додати фото</span>
                            <span className="text-xs mt-1">JPG, PNG, WEBP • до 5MB • {imagesCountText}</span>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                    handleAddImages(e.target.files)
                                    e.target.value = ""
                                }}
                                disabled={isAnyActionLoading}
                            />
                        </label>

                        {images.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                {images.map((img, index) => (
                                    <div
                                        key={`${img.previewUrl}-${index}`}
                                        className="relative group aspect-square bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden"
                                    >
                                        <img
                                            src={img.previewUrl}
                                            alt="preview"
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.opacity = "0.3"
                                            }}
                                        />
                                        <button
                                            type="button"
                                            disabled={isAnyActionLoading}
                                            onClick={() => handleRemoveImage(index)}
                                            className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all"
                                            aria-label="Видалити фото"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                        {index === 0 ? (
                                            <span className="absolute bottom-1.5 left-1.5 text-[10px] font-medium bg-primary text-primary-foreground px-2 py-0.5 rounded-md shadow-sm">
                                                Головне
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled={isAnyActionLoading}
                                                onClick={() => handleMakeMain(index)}
                                                className="absolute bottom-1.5 left-1.5 text-[10px] font-medium bg-black/60 hover:bg-black text-white px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                Зробити головним
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {errors.images && <p className="text-sm font-medium text-destructive">{errors.images.message?.toString()}</p>}
                    </CardContent>
                </Card>

                <Card className={`border-gray-200/60 shadow-sm overflow-hidden rounded-3xl bg-gray-50/50 ${isAnyActionLoading ? "opacity-60 pointer-events-none" : ""}`}>
                    <CardHeader className="border-b border-gray-100 bg-white pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl"><Info className="h-5 w-5 text-primary" /> Про тваринку</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 bg-white space-y-8">
                        <Controller
                            name="petType"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-base font-semibold text-gray-800">Кого ви віддаєте?</FieldLabel>
                                    <div className="grid grid-cols-3 gap-3 mt-2">
                                        {PET_TYPES.map((type) => (
                                            <label
                                                key={type.value}
                                                className={`cursor-pointer flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-colors duration-200 ${field.value === type.value
                                                    ? "border-primary bg-primary/5 text-primary"
                                                    : "border-gray-200 hover:border-primary/40 text-gray-600 hover:bg-gray-50"
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    className="hidden"
                                                    value={type.value}
                                                    checked={field.value === type.value}
                                                    onChange={() => field.onChange(type.value)}
                                                    disabled={isAnyActionLoading}
                                                />
                                                <type.icon className="h-5 w-5" />
                                                <span className="font-semibold text-sm">{type.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            name="petGender"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-base font-semibold text-gray-800">Стать</FieldLabel>
                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                        {PET_GENDERS.map((gender) => (
                                            <label
                                                key={gender.value}
                                                className={`cursor-pointer flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-colors duration-200 ${field.value === gender.value ? gender.activeClass : gender.idleClass
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    className="hidden"
                                                    value={gender.value}
                                                    checked={field.value === gender.value}
                                                    onChange={() => field.onChange(gender.value)}
                                                    disabled={isAnyActionLoading}
                                                />
                                                <gender.icon className="h-5 w-5" />
                                                <span className="font-semibold text-sm">{gender.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <Controller
                                name="petBreed"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel className="text-base font-semibold text-gray-800">
                                            Порода <span className="text-gray-400 font-normal text-sm">(необов'язково)</span>
                                        </FieldLabel>
                                        <Input className="bg-white" disabled={isAnyActionLoading} {...field} />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="petAgeMonth"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel className="text-base font-semibold text-gray-800">
                                            Вік <span className="text-gray-400 font-normal text-sm">(у місяцях)</span>
                                        </FieldLabel>
                                        <Input type="number" min="0" className="bg-white" disabled={isAnyActionLoading} {...field} />
                                        {fieldState.invalid ? (
                                            <FieldError errors={[fieldState.error]} />
                                        ) : (
                                            <div className="text-[12px] text-muted-foreground mt-1.5">
                                                Залиште пустим, якщо вік невідомий.
                                            </div>
                                        )}
                                    </Field>
                                )}
                            />
                        </div>

                        <div className="space-y-6 pt-6 border-t border-gray-100">
                            <Controller
                                name="title"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel className="text-base font-semibold text-gray-800">Короткий заголовок</FieldLabel>
                                        <Input className="text-base bg-white" disabled={isAnyActionLoading} {...field} />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="description"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel className="text-base font-semibold text-gray-800">Опис характеру та звичок</FieldLabel>
                                        <Textarea className="min-h-[140px] resize-y bg-white text-base" disabled={isAnyActionLoading} {...field} />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className={`border-gray-200/60 shadow-sm overflow-hidden rounded-3xl bg-gray-50/50 ${isAnyActionLoading ? "opacity-60 pointer-events-none" : ""}`}>
                    <CardHeader className="border-b border-gray-100 bg-white pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl"><MapPin className="h-5 w-5 text-primary" /> Місцезнаходження</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 bg-white grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Controller
                            name="country"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-base font-semibold text-gray-800">Країна</FieldLabel>
                                    <Input className="bg-white" disabled={isAnyActionLoading} {...field} />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="city"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-base font-semibold text-gray-800">Місто</FieldLabel>
                                    <Input className="bg-white" disabled={isAnyActionLoading} {...field} />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 pt-4 pb-12 border-t border-gray-100">
                    <Button
                        variant="ghost"
                        type="button"
                        size="lg"
                        onClick={handleCancelClick}
                        disabled={isAnyActionLoading}
                        className="px-4 text-gray-500 hover:text-gray-900 w-full sm:w-auto"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Повернутися
                    </Button>

                    <Button
                        type="submit"
                        size="lg"
                        disabled={!canSubmit}
                        className="px-10 shadow-md hover:shadow-lg transition-shadow w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Оновлюємо...
                            </>
                        ) : (
                            "Зберегти зміни"
                        )}
                    </Button>

                    <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Вийти без збереження?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    У вас є незбережені дані. Якщо ви вийдете зараз, усі внесені зміни будуть втрачені назавжди.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Залишитися</AlertDialogCancel>
                                <AlertDialogAction onClick={() => router.back()} className="bg-red-500 hover:bg-red-600 text-white">
                                    Так, вийти
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </form>
        </div>
    )
}
