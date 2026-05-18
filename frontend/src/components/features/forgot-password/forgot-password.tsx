"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { useForgotPassword } from "@/hook/useForgotPassword"

const schema = z.object({
    email: z.email("Введіть правильний email адресу"),
})

export function ForgotPassword() {
    const [isSuccess, setIsSuccess] = useState(false)
    const { mutateAsync: forgotPassword, isPending } = useForgotPassword()

    const { control, handleSubmit, formState: { isValid } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { email: "" },
        mode: "onBlur"
    })

    const onSubmit = async (data: { email: string }) => {
        try {
            await forgotPassword(data.email)
            setIsSuccess(true)
        } catch {
            setIsSuccess(true)
        }
    }

    if (isSuccess) {
        return (
            <Card className="w-full max-w-md shadow-lg text-center p-6">
                <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-6 h-6" />
                </div>
                <CardTitle className="mb-2">Перевірте пошту</CardTitle>
                <CardDescription className="mb-6">
                    Якщо акаунт з таким email існує, ми надіслали інструкції з відновлення пароля. Посилання дійсне 15 хвилин.
                </CardDescription>
                <Button asChild variant="outline" className="w-full cursor-pointer">
                    <Link href="/login">Повернутися до входу</Link>
                </Button>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md shadow-lg">
            <CardHeader>
                <CardTitle>Відновлення пароля</CardTitle>
                <CardDescription>
                    Введіть email, на який зареєстровано ваш акаунт, і ми надішлемо вам посилання для створення нового пароля.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <FieldGroup>
                        <Controller
                            name="email"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Email</FieldLabel>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input className="pl-9 h-11" placeholder="name@example.com" {...field} />
                                    </div>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </FieldGroup>

                    <div className="space-y-3">
                        <Button type="submit" disabled={!isValid || isPending} className="w-full h-11 font-bold cursor-pointer">
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Надіслати посилання
                        </Button>
                        <Button asChild variant="ghost" className="w-full cursor-pointer">
                            <Link href="/login"><ArrowLeft className="w-4 h-4 mr-2" /> Повернутися</Link>
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
