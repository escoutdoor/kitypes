"use client"

import { UserRole } from "@/service/user/user.interface"
import { useEffect, useRef, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Save, User as UserIcon, Camera, PawPrint, Heart, Trash2, PhoneCall } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader } from "@/components/ui/loader"

import { useProfile } from "@/hook/useProfile"
import { useUpdateProfile } from "@/hook/useUpdateProfile"
import { useDeleteAvatar } from "@/hook/useDeleteAvatar"
import { UserService } from "@/service/user/user.service"
import { S3Service } from "@/lib/s3"
import { cn } from "@/lib/utils"

const ROLE_CONFIG: Record<UserRole, { label: string; colorClass: string }> = {
    user: {
        label: "Користувач",
        colorClass: "bg-gray-100 text-gray-600 border border-transparent"
    },
    volunteer: {
        label: "Волонтер 💙",
        colorClass: "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
    },
    shelter: {
        label: "Притулок 🏡",
        colorClass: "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm"
    },
    admin: {
        label: "Адміністратор 👑",
        colorClass: "bg-purple-50 text-purple-700 border border-purple-200 shadow-sm"
    },
}

const profileSchema = z.object({
    firstName: z.string().min(2, "Ім'я має містити мінімум 2 символи").max(20, "Занадто довге ім'я"),
    lastName: z.string().min(2, "Прізвище має містити мінімум 2 символи").max(20, "Занадто довге прізвище"),
    phoneNumber: z
        .string()
        .min(1, "Номер телефону є обов'язковим")
        .regex(/^\+380\d{9}$/, "Формат: +380XXXXXXXXX"),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function Profile() {
    const { user, isLoadingProfile } = useProfile()
    const { mutateAsync: updateProfileAsync, isPending } = useUpdateProfile()
    const { mutateAsync: deleteAvatarAsync, isPending: isDeletingAvatar } = useDeleteAvatar()

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null)

    const {
        control,
        handleSubmit,
        formState: { isDirty },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        values: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            phoneNumber: user?.phoneNumber || "",
        },
        mode: "onChange",
    })

    useEffect(() => {
        return () => {
            if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl)
        }
    }, [avatarPreviewUrl])

    const onSubmit = async (data: ProfileFormValues) => {
        try {
            await updateProfileAsync({
                firstName: data.firstName !== user?.firstName ? data.firstName : undefined,
                lastName: data.lastName !== user?.lastName ? data.lastName : undefined,
                phoneNumber: data.phoneNumber !== user?.phoneNumber ? data.phoneNumber : undefined,
            })
            toast.success("Особисту інформацію збережено!")
        } catch (error) {
            toast.error("Не вдалося оновити профіль. Спробуйте пізніше.")
        }
    }

    const handleDeleteAvatar = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!user?.avatarUrl) return
        try {
            await deleteAvatarAsync()
            if (avatarPreviewUrl) {
                URL.revokeObjectURL(avatarPreviewUrl)
                setAvatarPreviewUrl(null)
            }
            toast.success("Фото успішно видалено!")
        } catch (error) {
            toast.error("Не вдалося видалити фото.")
        }
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("image/")) {
            toast.error("Будь ласка, виберіть зображення (JPG, PNG, WEBP)")
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Файл занадто великий. Максимум 5MB.")
            event.currentTarget.value = ""
            return
        }

        const nextPreview = URL.createObjectURL(file)
        setAvatarPreviewUrl(nextPreview)

        try {
            setIsUploadingAvatar(true)
            const ext = `.${file.name.split(".").pop()?.toLowerCase() || "jpg"}`
            const { uploadUrl, avatarKey } = await UserService.getUploadUrl(ext)
            await S3Service.uploadFile(uploadUrl, file)
            await updateProfileAsync({ avatarKey })
            setAvatarPreviewUrl(null)
            toast.success("Аватарку оновлено!")
        } catch (error) {
            toast.error("Помилка завантаження.")
            setAvatarPreviewUrl(null)
        } finally {
            setIsUploadingAvatar(false)
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    if (isLoadingProfile) return <Loader />

    const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : "U"
    const avatarSrc = avatarPreviewUrl || user?.avatarUrl || undefined

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

            <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3.5 rounded-2xl text-primary shadow-sm border border-primary/10">
                    <PawPrint className="h-8 w-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Привіт, {user?.firstName}! 👋</h1>
                    <p className="text-muted-foreground flex items-center gap-1.5 mt-1 font-medium text-[15px]">
                        Допомагаємо тваринам знаходити дім <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
                    </p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-[1fr_2.5fr] items-start">

                <Card className="overflow-hidden border-none shadow-md bg-white">
                    <div className="h-24 bg-gradient-to-r from-primary/40 to-primary/20 relative overflow-hidden">
                        <PawPrint className="absolute right-2 -bottom-4 h-16 w-16 text-white/40 rotate-12" />
                    </div>

                    <CardContent className="flex flex-col items-center p-6 -mt-12 relative z-10">
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

                        <div className="relative group inline-block mb-4">
                            <div
                                className={cn(
                                    "relative rounded-full overflow-hidden border-4 border-white shadow-lg bg-white",
                                    isUploadingAvatar || isDeletingAvatar ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                                )}
                                onClick={() => { if (!isUploadingAvatar && !isDeletingAvatar) fileInputRef.current?.click() }}
                            >
                                <Avatar className="h-32 w-32">
                                    <AvatarImage src={avatarSrc} className="object-cover" />
                                    <AvatarFallback className="text-4xl font-bold bg-primary/5 text-primary">{initials}</AvatarFallback>
                                </Avatar>

                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                    {isUploadingAvatar || isDeletingAvatar ? <Loader2 className="animate-spin text-white h-8 w-8" /> : <Camera className="text-white h-8 w-8" />}
                                </div>
                            </div>

                            {avatarSrc && !isUploadingAvatar && !isDeletingAvatar && (
                                <button
                                    onClick={handleDeleteAvatar}
                                    type="button"
                                    className="absolute bottom-1 right-1 bg-white p-2.5 rounded-full shadow-lg text-red-500 hover:text-white hover:bg-red-500 transition-all cursor-pointer opacity-0 group-hover:opacity-100 z-20 focus:opacity-100"
                                    title="Видалити фото"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="text-center w-full">
                            <h3 className="font-bold text-xl text-gray-900 mb-1.5">
                                {user?.firstName} {user?.lastName}
                            </h3>
                            {user?.role && (
                                <span className={cn(
                                    "inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-5 transition-colors",
                                    ROLE_CONFIG[user.role].colorClass
                                )}>
                                    {ROLE_CONFIG[user.role].label}
                                </span>
                            )}

                            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 text-left w-full">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Camera className="w-4 h-4 text-primary" />
                                    <h4 className="text-sm font-bold text-gray-900">Більше довіри</h4>
                                </div>
                                <p className="text-[13px] text-gray-600 leading-snug font-medium">
                                    Профілі з реальним фото знаходять дім для тварин значно швидше.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="relative overflow-hidden border-none shadow-md bg-white">
                        <div className="absolute -right-12 -top-12 opacity-[0.03] pointer-events-none select-none">
                            <PawPrint className="w-96 h-96 -rotate-12" />
                        </div>

                        <CardHeader className="relative z-10 border-b border-gray-100/50 pb-5">
                            <CardTitle className="text-xl">Особиста інформація</CardTitle>
                            <CardDescription>Ці дані бачитимуть люди, які захочуть забрати тваринку.</CardDescription>
                        </CardHeader>

                        <CardContent className="relative z-10 pt-7">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                                <div className="bg-primary/5 rounded-2xl p-5 flex items-start gap-4 border border-primary/10">
                                    <div className="bg-white p-2 rounded-full text-primary shadow-sm shrink-0">
                                        <PhoneCall className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-[15px] font-bold text-gray-900 mb-1">
                                            Залишайтесь на зв'язку
                                        </h4>
                                        <p className="text-[14px] text-gray-600 leading-relaxed">
                                            Переконайтесь, що ваш номер телефону актуальний, адже саме на нього можуть зателефонувати майбутні власники тварин.
                                        </p>
                                    </div>
                                </div>

                                <FieldGroup>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Controller
                                            name="firstName"
                                            control={control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel className="text-gray-700 font-medium">
                                                        Ім'я <span className="text-red-500 ml-0.5">*</span>
                                                    </FieldLabel>
                                                    <div className="relative">
                                                        <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                                                        <Input className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus-visible:bg-white focus-visible:ring-primary/50" placeholder="Іван" {...field} />
                                                    </div>
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />
                                        <Controller
                                            name="lastName"
                                            control={control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel className="text-gray-700 font-medium">
                                                        Прізвище <span className="text-red-500 ml-0.5">*</span>
                                                    </FieldLabel>
                                                    <Input className="h-11 bg-gray-50/50 border-gray-200 focus-visible:bg-white focus-visible:ring-primary/50" placeholder="Попов" {...field} />
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <Controller
                                            name="phoneNumber"
                                            control={control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel className="text-gray-700 font-medium mb-2">
                                                        Номер телефону <span className="text-red-500 ml-0.5">*</span>
                                                    </FieldLabel>
                                                    <div className="relative">
                                                        <PhoneCall className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                                                        <Input className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus-visible:bg-white focus-visible:ring-primary/50" placeholder="+380981234567" {...field} />
                                                    </div>
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />
                                    </div>
                                </FieldGroup>

                                <div className="flex justify-end pt-4 border-t border-gray-100/50 mt-8">
                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={!isDirty || isPending || isUploadingAvatar}
                                        className="w-full sm:w-auto px-8 rounded-xl font-semibold shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
                                    >
                                        {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                                        Зберегти зміни
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
