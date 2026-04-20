"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    PawPrint,
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
} from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

import { AdService } from "@/service/ad/ad.service"
import { S3Service } from "@/lib/s3"

const MAX_IMAGES = 10
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const

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
        idleClass: "border-gray-200 hover:border-blue-300 text-gray-600 hover:bg-gray-50"
    },
    {
        value: 2,
        label: "Дівчинка",
        icon: Venus,
        activeClass: "border-pink-500 bg-pink-50 text-pink-700",
        idleClass: "border-gray-200 hover:border-pink-300 text-gray-600 hover:bg-gray-50"
    },
] as const

const createAdSchema = z.object({
    title: z.string().trim().min(5, "Мінімум 5 символів").max(100, "Максимум 100 символів"),
    description: z.string().trim().min(20, "Опишіть тваринку детальніше (мінімум 20 символів)"),
    petType: z.number().min(1, "Оберіть тип тваринки").max(3),
    petGender: z.number().min(1, "Оберіть стать").max(2),
    petAgeMonth: z.string().optional()
        .refine((v) => !v || /^\d+$/.test(v), "Вік має бути цілим числом")
        .refine((v) => !v || Number(v) >= 0, "Вік не може бути від'ємним"),
    petBreed: z.string().trim().max(50, "Максимум 50 символів").optional(),
    country: z.string().trim().min(2, "Вкажіть країну"),
    city: z.string().trim().min(2, "Вкажіть місто"),
    images: z.array(z.instanceof(File))
        .min(1, "Додайте хоча б одну фотографію")
        .max(MAX_IMAGES, `Максимум ${MAX_IMAGES} фотографій`),
})

type CreateAdFormValues = z.infer<typeof createAdSchema>

export default function CreateAdPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [previews, setPreviews] = useState<string[]>([])

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<CreateAdFormValues>({
        resolver: zodResolver(createAdSchema),
        mode: "onSubmit",
        defaultValues: {
            title: "",
            description: "",
            petBreed: "",
            country: "Україна",
            city: "",
            images: [],
            petType: 0,
            petGender: 0,
            petAgeMonth: "",
        },
    })

    const images = watch("images")
    const imagesCountText = useMemo(() => `${images?.length || 0}/${MAX_IMAGES}`, [images])

    useEffect(() => {
        const nextPreviews = (images || []).map((file) => URL.createObjectURL(file))
        setPreviews(nextPreviews)
        return () => {
            nextPreviews.forEach((url) => URL.revokeObjectURL(url))
        }
    }, [images])

    const validateSelectedFiles = (files: File[]): string | null => {
        if (!files.length) return null
        for (const file of files) {
            if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
                return `Файл "${file.name}" має невалідний формат. Дозволено: JPG, PNG, WEBP`
            }
            if (file.size > MAX_FILE_SIZE_BYTES) {
                return `Файл "${file.name}" завеликий. Максимум 5MB`
            }
        }
        return null
    }

    const handleAddImages = (list: FileList | null) => {
        if (!list) return
        const picked = Array.from(list)

        const filesError = validateSelectedFiles(picked)
        if (filesError) {
            toast.error(filesError)
            return
        }

        const current = images || []
        const merged = [...current, ...picked]

        if (merged.length > MAX_IMAGES) {
            toast.error(`Максимум ${MAX_IMAGES} фотографій`)
            setValue("images", merged.slice(0, MAX_IMAGES), { shouldValidate: true })
            return
        }

        setValue("images", merged, { shouldValidate: true })
    }

    const handleRemoveImage = (index: number) => {
        const current = [...(images || [])]
        current.splice(index, 1)
        setValue("images", current, { shouldValidate: true })
    }

    const handleMakeMain = (index: number) => {
        if (index === 0) return
        const current = [...(images || [])]
        const [selected] = current.splice(index, 1)
        current.unshift(selected)
        setValue("images", current, { shouldValidate: true })
    }

    const onSubmit = async (data: CreateAdFormValues) => {
        try {
            setIsSubmitting(true)

            const uploadMeta = await AdService.getUploadUrls({
                files: data.images.map((file) => ({
                    ext: `.${file.name.split(".").pop()?.toLowerCase() || "jpg"}`,
                })),
            })

            if (!uploadMeta.items?.length || uploadMeta.items.length !== data.images.length) {
                throw new Error("Невірна відповідь від сервера при отриманні URL для завантаження")
            }

            await Promise.all(
                uploadMeta.items.map((item, idx) => S3Service.uploadFile(item.uploadUrl, data.images[idx]))
            )

            await AdService.create({
                title: data.title,
                description: data.description,
                imageKeys: uploadMeta.items.map((item) => item.imageKey),
                petType: data.petType,
                petGender: data.petGender,
                petAgeMonth: data.petAgeMonth ? Number(data.petAgeMonth) : undefined,
                petBreed: data.petBreed || undefined,
                country: data.country,
                city: data.city,
            })

            toast.success("Оголошення успішно опубліковано!")
            router.push("/ads")
        } catch (error) {
            console.error(error)
            toast.error("Не вдалося створити оголошення. Спробуйте ще раз.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 md:px-0 animate-in fade-in duration-500">
            <div className="mb-10 text-center space-y-3">
                <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-2">
                    <PawPrint className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Знайти новий дім</h1>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                    Чим детальніше ви опишете хвостика та чим кращі фото додасте, тим швидше він знайде родину.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                {/* Фотографії */}
                <Card className="border-gray-200/60 shadow-sm overflow-hidden rounded-2xl">
                    <CardHeader className="border-b border-gray-100 bg-white pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Camera className="h-5 w-5 text-primary" />
                            Фотографії
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Додайте від 1 до {MAX_IMAGES} якісних фотографій. Перше фото буде головним.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6 bg-white space-y-4">
                        <label className="h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-gray-50/50 cursor-pointer hover:border-primary/50 transition">
                            <Upload className="h-6 w-6 mb-2" />
                            <span className="font-medium text-gray-700">Натисніть, щоб обрати фото</span>
                            <span className="text-xs mt-1">JPG, PNG, WEBP • до 5MB • {imagesCountText}</span>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                className="hidden"
                                onChange={(e) => handleAddImages(e.target.files)}
                            />
                        </label>

                        {previews.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                {previews.map((src, index) => (
                                    <div key={`${src}-${index}`} className="relative group aspect-square">
                                        <img src={src} alt={`preview-${index}`} className="h-full w-full object-cover rounded-lg border border-gray-200" />

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                            className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all"
                                            title="Видалити фото"
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

                        {errors.images && (
                            <p className="text-sm font-medium text-destructive">
                                {errors.images.message?.toString()}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Основна інформація */}
                <Card className="border-gray-200/60 shadow-sm overflow-hidden rounded-2xl">
                    <CardHeader className="border-b border-gray-100 bg-white pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Info className="h-5 w-5 text-primary" />
                            Про хвостика
                        </CardTitle>
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
                                        <Input placeholder="Напр., Мейн-кун або Дворняжка" className="bg-gray-50/50" {...field} />
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
                                        <Input type="number" placeholder="Напр., 3" min="0" className="bg-gray-50/50" {...field} />
                                        {fieldState.invalid ? (
                                            <FieldError errors={[fieldState.error]} />
                                        ) : (
                                            <div className="text-[12px] text-muted-foreground mt-1.5">
                                                Залиште пустим, якщо вік невідомий. (1 рік = 12 міс.)
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
                                        <Input placeholder="Рудий котик шукає сім'ю..." className="text-base bg-gray-50/50" {...field} />
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
                                        <Textarea
                                            placeholder="Розкажіть про характер тваринки, чи привчена до лотка, як ставиться до інших тварин..."
                                            className="min-h-[140px] resize-y bg-gray-50/50 text-base"
                                            {...field}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Локація */}
                <Card className="border-gray-200/60 shadow-sm overflow-hidden rounded-2xl">
                    <CardHeader className="border-b border-gray-100 bg-white pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <MapPin className="h-5 w-5 text-primary" />
                            Місцезнаходження
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 bg-white grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Controller
                            name="country"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-base font-semibold text-gray-800">Країна</FieldLabel>
                                    <Input className="bg-gray-50/50" {...field} />
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
                                    <Input placeholder="Наприклад, Дніпро" className="bg-gray-50/50" {...field} />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Кнопки */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-4 pb-12">
                    <Button
                        variant="outline"
                        type="button"
                        size="lg"
                        onClick={() => router.back()}
                        className="px-8"
                    >
                        Скасувати
                    </Button>
                    <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting}
                        className="px-8 shadow-md hover:shadow-lg transition-shadow"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Публікація...
                            </>
                        ) : (
                            "Опублікувати оголошення"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
