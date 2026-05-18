"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Loader2, KeyRound } from "lucide-react"
import { toast } from "sonner"
import { isAxiosError } from "axios"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { useResetPassword } from "@/hook/useResetPassword"

const schema = z.object({
    newPassword: z.string().min(8, "Мінімум 8 символів").max(20, "Максимум 20 символів"),
    confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Паролі не співпадають",
    path: ["confirmPassword"],
})

type FormValues = z.infer<typeof schema>

export function ResetPassword() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [showPassword, setShowPassword] = useState(false)
    const { mutateAsync: resetPassword, isPending } = useResetPassword()

    const { control, handleSubmit, setError, formState: { isValid } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { newPassword: "", confirmPassword: "" },
        mode: "onBlur"
    })

    if (!token) {
        return (
            <Card className="w-full max-w-md shadow-lg text-center p-8">
                <CardTitle className="text-red-500 mb-2">Недійсне посилання</CardTitle>
                <CardDescription className="mb-6">Посилання для відновлення пароля пошкоджене або відсутнє.</CardDescription>
                <Button onClick={() => router.push("/forgot-password")} className="cursor-pointer">Запросити нове</Button>
            </Card>
        )
    }

    const onSubmit = async (data: FormValues) => {
        try {
            await resetPassword({ token, newPassword: data.newPassword })
            toast.success("Пароль успішно змінено!")
            router.push("/login")
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 400) {
                setError("root", { message: "Термін дії посилання вичерпано або воно вже використане. Запросіть нове." })
            } else {
                setError("root", { message: "Виникла помилка. Спробуйте пізніше." })
            }
        }
    }

    return (
        <Card className="w-full max-w-md shadow-lg">
            <CardHeader>
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-3">
                    <KeyRound className="w-5 h-5" />
                </div>
                <CardTitle>Новий пароль</CardTitle>
                <CardDescription>Введіть новий надійний пароль для вашого акаунту.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <FieldGroup>
                        <Controller
                            name="newPassword"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Новий пароль</FieldLabel>
                                    <div className="relative">
                                        <Input type={showPassword ? "text" : "password"} className="h-11" placeholder="••••••••" {...field} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="confirmPassword"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Підтвердіть пароль</FieldLabel>
                                    <div className="relative">
                                        <Input type={showPassword ? "text" : "password"} className="h-11" placeholder="••••••••" {...field} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </FieldGroup>

                    <FieldError errors={[{ message: control._formState.errors.root?.message }]} />

                    <Button type="submit" disabled={!isValid || isPending} className="w-full h-11 font-bold cursor-pointer">
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Зберегти та увійти
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
