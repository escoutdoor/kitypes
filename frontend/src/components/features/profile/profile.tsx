"use client"

import { useEffect, useRef, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Mail, Phone, Save, User as UserIcon, Camera, PawPrint, Heart } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader } from "@/components/ui/loader"

import { useProfile } from "@/hook/useProfile"
import { useUpdateProfile } from "@/hook/useUpdateProfile"
import { UserService } from "@/service/user/user.service"
import { S3Service } from "@/lib/s3"

const profileSchema = z.object({
    firstName: z.string().min(2, "Ім'я має містити мінімум 2 символи").max(20, "Занадто довге ім'я"),
    lastName: z.string().min(2, "Прізвище має містити мінімум 2 символи").max(20, "Занадто довге прізвище"),
    phoneNumber: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, "Неправильний формат телефону (напр. +380981234567)")
        .optional()
        .or(z.literal("")),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function Profile() {
    const { user, isLoadingProfile } = useProfile()

    const { mutateAsync: updateProfileAsync, isPending } = useUpdateProfile()

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

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("image/")) {
            toast.error("Будь ласка, виберіть зображення (JPG, PNG, WEBP)")
            event.currentTarget.value = ""
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Файл занадто великий. Максимум 5MB.")
            event.currentTarget.value = ""
            return
        }

        const nextPreview = URL.createObjectURL(file)
        setAvatarPreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev)
            return nextPreview
        })

        try {
            setIsUploadingAvatar(true)
            const ext = `.${file.name.split(".").pop()?.toLowerCase() || "jpg"}`
            const { uploadUrl, avatarKey } = await UserService.getUploadUrl(ext)
            await S3Service.uploadFile(uploadUrl, file)

            await updateProfileAsync({ avatarKey: avatarKey })
            setAvatarPreviewUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev)
                return null
            })

            toast.success("Аватарку успішно оновлено!")
        } catch (error) {
            console.error(error)
            toast.error("Помилка при завантаженні фото. Спробуйте ще раз.")

            setAvatarPreviewUrl(prev => {
                if (prev) URL.revokeObjectURL(prev)
                return null
            })
        } finally {
            setIsUploadingAvatar(false)
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    const handleAvatarClick = () => {
        if (!isUploadingAvatar) fileInputRef.current?.click()
    }

    const handleAvatarKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (isUploadingAvatar) return
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            fileInputRef.current?.click()
        }
    }

    if (isLoadingProfile) {
        return <Loader />
    }

    const initials = user ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() : "U"
    const avatarSrc = avatarPreviewUrl || user?.avatarUrl || undefined

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                    <PawPrint className="h-8 w-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Привіт, {user?.firstName}! 👋
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-1 mt-1">
                        Дякуємо, що допомагаєте хвостикам знаходити дім{" "}
                        <Heart className="h-4 w-4 text-red-400 fill-red-400" />
                    </p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-[1fr_2.5fr]">
                <Card className="h-fit overflow-hidden border-none shadow-md">
                    <div className="h-24 bg-gradient-to-r from-primary/40 to-primary/20 relative">
                        <PawPrint className="absolute right-2 -bottom-4 h-16 w-16 text-white/40 rotate-12" />
                    </div>

                    <CardContent className="flex flex-col items-center p-6 -mt-12 relative z-10">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/jpeg, image/png, image/webp"
                            onChange={handleFileChange}
                        />

                        <div
                            aria-busy={isUploadingAvatar}
                            aria-disabled={isUploadingAvatar}
                            className={`relative group rounded-full ${isUploadingAvatar ? "cursor-not-allowed" : "cursor-pointer"
                                }`}
                            role="button"
                            tabIndex={0}
                            aria-label="Змінити аватар"
                            onClick={handleAvatarClick}
                            onKeyDown={handleAvatarKeyDown}
                        >
                            <Avatar
                                className={`h-32 w-32 border-4 border-white shadow-lg bg-white transition-opacity duration-200 ${isUploadingAvatar ? "opacity-60" : ""
                                    }`}
                            >
                                <AvatarImage
                                    src={avatarSrc}
                                    alt={user?.firstName || "User avatar"}
                                    className="object-cover"
                                />

                                <AvatarFallback className="text-4xl font-bold bg-primary/5 text-primary" >
                                    {initials}
                                </AvatarFallback>
                            </Avatar>

                            <div
                                className={`absolute inset-0 bg-black/50 rounded-full flex items-center justify-center transition-opacity duration-200 ${isUploadingAvatar ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                    }`}
                            >
                                {isUploadingAvatar ? (
                                    <Loader2 className="text-white h-8 w-8 animate-spin" />
                                ) : (
                                    <Camera className="text-white h-8 w-8" />
                                )}
                            </div>
                        </div>

                        <div className="text-center mt-4 space-y-1">
                            <h3 className="font-bold text-xl text-gray-800">
                                {user?.firstName} {user?.lastName}
                            </h3>
                            <div className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                Користувач
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-none shadow-md">
                    <div className="absolute -right-12 -top-12 opacity-[0.03] pointer-events-none select-none">
                        <PawPrint className="w-96 h-96 -rotate-12" />
                    </div>

                    <CardHeader className="relative z-10 border-b bg-gray-50/50 pb-4">
                        <CardTitle className="text-xl">Особиста інформація</CardTitle>
                        <CardDescription>Ці дані потрібні, щоб майбутні власники могли з вами зв'язатися.</CardDescription>
                    </CardHeader>

                    <CardContent className="relative z-10 pt-6">
                        <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <FieldGroup>

                                <Field>
                                    <FieldLabel>Email адреса</FieldLabel>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            value={user?.email || ""}
                                            disabled
                                            className="pl-10 bg-gray-50 cursor-not-allowed border-gray-200 text-gray-500"
                                        />
                                    </div>
                                    <div className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                                        <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                                        Прив'язано до акаунту KityPes
                                    </div>
                                </Field>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                                    <Controller
                                        name="firstName"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor="firstName">Ім'я</FieldLabel>
                                                <div className="relative">
                                                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        id="firstName"
                                                        placeholder="Іван"
                                                        className="pl-10 focus-visible:ring-primary/50 transition-shadow"
                                                        {...field}
                                                    />
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
                                                <FieldLabel htmlFor="lastName">Прізвище</FieldLabel>
                                                <Input
                                                    id="lastName"
                                                    placeholder="Попов"
                                                    className="focus-visible:ring-primary/50 transition-shadow"
                                                    {...field}
                                                />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                </div>

                                <Controller
                                    name="phoneNumber"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="phoneNumber">Номер телефону</FieldLabel>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="phoneNumber"
                                                    placeholder="+380981234567"
                                                    className="pl-10 focus-visible:ring-primary/50 transition-shadow"
                                                    {...field}
                                                />
                                            </div>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                            </FieldGroup>

                            <div className="flex justify-end pt-4">
                                <Button
                                    type="submit"
                                    disabled={!isDirty || isPending || isUploadingAvatar}
                                    className="w-full sm:w-auto shadow-sm transition-all duration-200"
                                >
                                    {isPending && !isUploadingAvatar ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Збереження...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" /> Зберегти зміни
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
