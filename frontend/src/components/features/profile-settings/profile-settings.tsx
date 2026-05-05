"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    ShieldCheck, Key, Mail, AlertOctagon,
    Loader2, Save, Trash2, Eye, EyeOff,
    Cat, Bone, Dog
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader } from "@/components/ui/loader"
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

import { useProfile } from "@/hook/useProfile"
import { useUpdatePassword } from "@/hook/useUpdatePassword"
import { useUpdateEmail } from "@/hook/useUpdateEmail"
import { useDeleteAccount } from "@/hook/useDeleteAccount"
import { useAuthStore } from "@/store/auth.store"
import { cn } from "@/lib/utils"

const emailSchema = z.object({
    email: z.email({ message: "Некоректний формат пошти" }),
    password: z.string().min(1, { message: "Потрібен пароль для підтвердження" }),
})

const passwordSchema = z.object({
    oldPassword: z.string().min(1, { message: "Введіть поточний пароль" }),
    newPassword: z
        .string()
        .min(8, { message: "Мінімум 8 символів" })
        .max(20, { message: "Максимум 20 символів" }),
    confirmPassword: z.string().min(1, { message: "Підтвердіть новий пароль" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Паролі не збігаються",
    path: ["confirmPassword"],
})

type EmailFormValues = z.infer<typeof emailSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

const PasswordInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, placeholder = "••••••••", ...props }, ref) => {
        const [show, setShow] = useState(false)
        return (
            <div className="relative w-full">
                <Input
                    {...props}
                    ref={ref}
                    type={show ? "text" : "password"}
                    placeholder={placeholder}
                    className={cn("h-11 pr-10 bg-white focus-visible:bg-white text-base shadow-sm transition-colors border-gray-200", className)}
                />
                <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                    {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            </div>
        )
    }
)
PasswordInput.displayName = "PasswordInput"

function NoticeBlue({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="rounded-2xl p-4 bg-blue-50/80 border border-blue-100/50 flex items-start gap-3.5 mb-5">
            <div className="bg-white p-2 rounded-full shadow-sm shrink-0">
                <Cat className="w-5 h-5 text-blue-500" />
            </div>
            <div className="pt-0.5">
                <h4 className="font-bold text-blue-900 text-[14px] mb-1">{title}</h4>
                <p className="text-[13px] text-blue-800/80 font-medium leading-relaxed">
                    {children}
                </p>
            </div>
        </div>
    )
}

function NoticeAmber({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="rounded-2xl p-4 bg-amber-50/80 border border-amber-100/50 flex items-start gap-3.5 mb-5">
            <div className="bg-white p-2 rounded-full shadow-sm shrink-0">
                <Bone className="w-5 h-5 text-amber-500" />
            </div>
            <div className="pt-0.5">
                <h4 className="font-bold text-amber-900 text-[14px] mb-1">{title}</h4>
                <p className="text-[13px] text-amber-800/80 font-medium leading-relaxed">
                    {children}
                </p>
            </div>
        </div>
    )
}

export default function ProfileSettings() {
    const router = useRouter()
    const { logout } = useAuthStore()
    const { user, isLoadingProfile } = useProfile()

    const { mutateAsync: updateEmailAsync, isPending: isUpdatingEmail } = useUpdateEmail()
    const { mutateAsync: updatePasswordAsync, isPending: isUpdatingPassword } = useUpdatePassword()
    const { mutateAsync: deleteAccountAsync, isPending: isDeleting } = useDeleteAccount()

    const [deleteConfirmationWord, setDeleteConfirmationWord] = useState("")

    const {
        control: controlEmail,
        handleSubmit: handleEmailSubmit,
        reset: resetEmail,
        setError: setEmailError,
        formState: { isDirty: isEmailDirty, isValid: isEmailValid },
    } = useForm<EmailFormValues>({
        resolver: zodResolver(emailSchema),
        values: { email: user?.email ?? "", password: "" },
        mode: "onChange",
    })

    const {
        control: controlPassword,
        handleSubmit: handlePasswordSubmit,
        reset: resetPassword,
        setError: setPasswordError,
        formState: { isDirty: isPasswordDirty, isValid: isPasswordValid },
    } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
        mode: "onChange",
    })

    const onEmailSubmit = async (data: EmailFormValues) => {
        try {
            await updateEmailAsync({ email: data.email, password: data.password })
            toast.success("Пошту успішно оновлено! 🐾")
            resetEmail({ email: data.email, password: "" })
        } catch {
            setEmailError("password", { type: "server", message: "Неправильний пароль або пошта вже зайнята" })
        }
    }

    const onPasswordSubmit = async (data: PasswordFormValues) => {
        try {
            await updatePasswordAsync({ oldPassword: data.oldPassword, newPassword: data.newPassword })
            toast.success("Пароль успішно оновлено! 🦴")
            resetPassword()
        } catch {
            setPasswordError("oldPassword", { type: "server", message: "Неправильний поточний пароль" })
        }
    }

    const handleDeleteAccount = async (e: React.MouseEvent) => {
        e.preventDefault()
        try {
            await deleteAccountAsync()
            toast.success("Акаунт видалено. Сподіваємось, ви ще повернетесь! 😿")
            await logout()
            router.push("/")
        } catch {
            toast.error("Сталася помилка при видаленні акаунту.")
        }
    }

    if (isLoadingProfile) return <Loader />

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">

            <div className="flex items-center gap-4 mb-8">
                <div className="bg-primary/10 p-4 rounded-2xl shrink-0 border border-primary/10">
                    <ShieldCheck className="h-7 w-7 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Налаштування безпеки</h1>
                    <p className="text-muted-foreground text-[15px] font-medium mt-1">
                        Керуйте доступом та захищайте дані своїх пухнастиків
                    </p>
                </div>
            </div>

            <Card className="border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-3xl overflow-hidden bg-white">
                <CardHeader className="pt-7 px-7 pb-2">
                    <CardTitle className="text-xl font-bold flex items-center gap-2.5 text-gray-900">
                        <div className="bg-primary/10 p-2 rounded-xl border border-primary/5">
                            <Mail className="h-5 w-5 text-primary" />
                        </div>
                        Електронна пошта
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-7 pt-4 pb-7">
                    <NoticeBlue title="Безпека пухнастиків">
                        Зміна пошти потребує підтвердження поточного пароля. Це додатковий бар'єр, який захищає анкети ваших тварин від небажаних гостей.
                    </NoticeBlue>

                    <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-5">

                        <input type="text" name="username" value={user?.email || ""} autoComplete="username" className="hidden" readOnly />

                        <div className="bg-slate-50/80 p-6 rounded-[24px] border border-slate-100 flex flex-col gap-4">
                            <Controller
                                name="email"
                                control={controlEmail}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="w-full flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between">
                                            <FieldLabel className="text-[14px] font-bold text-gray-800">
                                                Нова адреса пошти
                                            </FieldLabel>
                                            {user?.email && (
                                                <Badge variant="secondary" className="text-xs font-medium text-muted-foreground px-2.5 py-0.5 rounded-lg bg-white border border-gray-200 shadow-sm">
                                                    Поточна: {user.email}
                                                </Badge>
                                            )}
                                        </div>
                                        <Input
                                            {...field}
                                            type="email"
                                            autoComplete="email"
                                            placeholder="example@gmail.com"
                                            className="h-11 bg-white focus-visible:bg-white text-base shadow-sm transition-colors w-full border-gray-200"
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-[13px]" />}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="password"
                                control={controlEmail}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="w-full flex flex-col gap-1.5">
                                        <FieldLabel className="text-[14px] font-bold text-gray-800">
                                            Поточний пароль
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            type="password"
                                            autoComplete="current-password"
                                            placeholder="••••••••"
                                            className="h-11 bg-white focus-visible:bg-white text-base shadow-sm transition-colors w-full border-gray-200"
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-[13px]" />}
                                    </Field>
                                )}
                            />
                        </div>

                        <div className="pt-1">
                            <Button
                                type="submit"
                                size="lg"
                                disabled={!isEmailDirty || !isEmailValid || isUpdatingEmail}
                                className="rounded-xl font-bold cursor-pointer px-8 w-full sm:w-auto shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                            >
                                {isUpdatingEmail ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                                Зберегти пошту
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-3xl overflow-hidden bg-white">
                <CardHeader className="pt-7 px-7 pb-2">
                    <CardTitle className="text-xl font-bold flex items-center gap-2.5 text-gray-900">
                        <div className="bg-primary/10 p-2 rounded-xl border border-primary/5">
                            <Key className="h-5 w-5 text-primary" />
                        </div>
                        Зміна пароля
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-7 pt-4 pb-7">
                    <NoticeAmber title="Міцний паркан для улюбленців">
                        Надійний пароль надійно захищає сторінки ваших тварин. Використовуйте комбінацію з щонайменше 8 символів, щоб уникнути злому.
                    </NoticeAmber>

                    <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-5">

                        <input type="text" name="username" value={user?.email || ""} autoComplete="username" className="hidden" readOnly />

                        <div className="bg-slate-50/80 p-6 rounded-[24px] border border-slate-100 flex flex-col gap-4">
                            <Controller
                                name="oldPassword"
                                control={controlPassword}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="w-full flex flex-col gap-1.5">
                                        <FieldLabel className="text-[14px] font-bold text-gray-800">
                                            Поточний пароль
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            type="password"
                                            autoComplete="current-password"
                                            placeholder="••••••••"
                                            className="h-11 bg-white focus-visible:bg-white text-base shadow-sm transition-colors w-full border-gray-200"
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-[13px]" />}
                                    </Field>
                                )}
                            />

                            <div className="border-t border-gray-200/60 my-1"></div>

                            <Controller
                                name="newPassword"
                                control={controlPassword}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="w-full flex flex-col gap-1.5">
                                        <FieldLabel className="text-[14px] font-bold text-gray-800">
                                            Новий пароль
                                        </FieldLabel>
                                        <PasswordInput {...field} autoComplete="new-password" />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-[13px]" />}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="confirmPassword"
                                control={controlPassword}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="w-full flex flex-col gap-1.5">
                                        <FieldLabel className="text-[14px] font-bold text-gray-800">
                                            Підтвердіть новий пароль
                                        </FieldLabel>
                                        <PasswordInput {...field} autoComplete="new-password" />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-[13px]" />}
                                    </Field>
                                )}
                            />
                        </div>

                        <div className="pt-1">
                            <Button
                                type="submit"
                                size="lg"
                                disabled={!isPasswordDirty || !isPasswordValid || isUpdatingPassword}
                                className="rounded-xl font-bold cursor-pointer px-8 w-full sm:w-auto shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                            >
                                {isUpdatingPassword ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                                Оновити пароль
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="pt-4">
                <Card className="border border-destructive/20 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-3xl overflow-hidden bg-white">
                    <CardHeader className="bg-destructive/5 pt-6 px-7 pb-4">
                        <CardTitle className="text-xl font-bold flex items-center gap-2.5 text-destructive">
                            <div className="bg-destructive/10 p-2 rounded-xl border border-destructive/10">
                                <AlertOctagon className="h-5 w-5 text-destructive" />
                            </div>
                            Небезпечна зона
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="px-7 pt-6 pb-7">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-2.5 mb-1.5">
                                    <Dog className="w-5 h-5 text-destructive" />
                                    <p className="text-[16px] font-bold text-gray-900">Прощання з KityPes</p>
                                </div>
                                <p className="text-[14px] text-gray-600 font-medium leading-relaxed max-w-lg">
                                    Видалення акаунту <span className="font-bold text-destructive">неможливо скасувати</span>.
                                    Всі ваші особисті дані, збережені контакти та активні анкети тварин будуть стерті назавжди.
                                </p>
                            </div>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        size="lg"
                                        className="shrink-0 rounded-xl font-bold cursor-pointer px-8 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                                    >
                                        <Trash2 className="mr-2 h-5 w-5" />
                                        Видалити акаунт
                                    </Button>
                                </AlertDialogTrigger>

                                <AlertDialogContent className="sm:max-w-[420px] rounded-3xl p-7 shadow-xl">
                                    <AlertDialogHeader className="flex flex-col items-center text-center gap-3">
                                        <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center">
                                            <AlertOctagon className="w-7 h-7 text-destructive" />
                                        </div>
                                        <AlertDialogTitle className="text-2xl font-extrabold text-gray-900">Ви впевнені?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-[14px] font-medium text-gray-600 leading-relaxed">
                                            Цю дію неможливо відмінити. Акаунт та всі анкети ваших тварин будуть видалені безповоротно.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>

                                    <div className="my-6 flex flex-col items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <p className="text-[13px] text-gray-700 font-semibold text-center">
                                            Введіть <span className="font-extrabold text-destructive select-all font-mono bg-destructive/10 px-1.5 py-0.5 rounded">ВИДАЛИТИ</span> для підтвердження:
                                        </p>
                                        <Input
                                            value={deleteConfirmationWord}
                                            onChange={(e) => setDeleteConfirmationWord(e.target.value)}
                                            placeholder="ВИДАЛИТИ"
                                            className="border-destructive/30 bg-white focus-visible:ring-destructive font-mono text-center tracking-[0.2em] text-base h-11 text-destructive placeholder:text-destructive/30 w-full font-bold shadow-sm"
                                        />
                                    </div>

                                    <AlertDialogFooter className="grid grid-cols-2 gap-3 sm:space-x-0 w-full">
                                        <AlertDialogCancel
                                            className="mt-0 rounded-xl h-11 font-bold cursor-pointer text-gray-700 hover:bg-gray-100 border-gray-200"
                                            onClick={() => setDeleteConfirmationWord("")}
                                        >
                                            Скасувати
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteAccount}
                                            disabled={deleteConfirmationWord !== "ВИДАЛИТИ" || isDeleting}
                                            className="rounded-xl h-11 font-bold cursor-pointer bg-destructive hover:bg-destructive/90 text-white shadow-sm"
                                        >
                                            {isDeleting
                                                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                : "Підтвердити"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
