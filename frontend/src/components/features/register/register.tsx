"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldError,
    FieldSeparator,
} from "@/components/ui/field"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import z from "zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/store/auth.store"

const registerSchema = z
    .object({
        firstName: z
            .string()
            .min(1, "Ім'я обов'язкове")
            .max(20, "Максимум 20 символів"),
        lastName: z
            .string()
            .min(1, "Прізвище обов'язкове")
            .max(20, "Максимум 20 символів"),
        email: z.email("Введіть правильний email"),
        phoneNumber: z
            .string()
            .regex(/^\+?[1-9]\d{1,14}$/, "Формат: +380XXXXXXXXX"),
        password: z
            .string()
            .min(8, "Мінімум 8 символів")
            .max(20, "Максимум 20 символів"),
        confirmPassword: z.string(),
    })
    .refine(data => data.password === data.confirmPassword, {
        message: "Паролі не співпадають",
        path: ["confirmPassword"],
    })

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()
    const registerAction = useAuthStore((state) => state.register)

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            password: "",
            confirmPassword: "",
        },
        mode: "onBlur",
    })

    const {
        control,
        handleSubmit,
        setError,
        formState: { isSubmitting, errors },
    } = form

    const onSubmit = async (data: RegisterFormValues) => {
        console.log("data:", data)

        try {
            const { confirmPassword, ...registerPayload } = data

            await registerAction(registerPayload)
            router.push("/")
        } catch (err: any) {
            console.log(err.response?.data?.message)
            const message = err.response?.data?.message || "Помилка при створенні акаунту"
            setError("root", { type: "manual", message: message })
        }
    }

    return (
        <Card className="w-full max-w-xl shadow-lg">
            <CardHeader>
                <CardTitle>Реєстрація</CardTitle>
                <CardDescription>
                    Зареєструйтесь та отримайте повний функціонал нашого порталу
                    для допомоги тваринкам
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form id="register-form" onSubmit={handleSubmit(onSubmit)}>
                    <FieldGroup>
                        {errors.root && (
                            <div className="rounded-md bg-red-50 p-3 mb-4 text-sm text-red-500">
                                {errors.root.message}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <Controller
                                name="firstName"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel
                                            htmlFor="firstName"
                                            aria-invalid={fieldState.invalid}
                                        >
                                            Ім'я
                                        </FieldLabel>
                                        <Input
                                            id="firstName"
                                            placeholder="Анатолій"
                                            aria-invalid={fieldState.invalid}
                                            {...field}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="lastName"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel
                                            htmlFor="lastName"
                                            aria-invalid={fieldState.invalid}
                                        >
                                            Прізвище
                                        </FieldLabel>
                                        <Input
                                            id="lastName"
                                            placeholder="Вовк"
                                            aria-invalid={fieldState.invalid}
                                            {...field}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                        </div>

                        <Controller
                            name="phoneNumber"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel
                                        htmlFor="phoneNumber"
                                        aria-invalid={fieldState.invalid}
                                    >
                                        Номер телефону
                                    </FieldLabel>
                                    <Input
                                        id="phoneNumber"
                                        placeholder="+380..."
                                        aria-invalid={fieldState.invalid}
                                        {...field}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />
                        <FieldSeparator />

                        <Controller
                            name="email"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel
                                        htmlFor="email"
                                        aria-invalid={fieldState.invalid}
                                    >
                                        Email
                                    </FieldLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        aria-invalid={fieldState.invalid}
                                        {...field}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            {/* Пароль */}
                            <Controller
                                name="password"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel
                                            htmlFor="password"
                                            aria-invalid={fieldState.invalid}
                                        >
                                            Пароль
                                        </FieldLabel>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                {...field}
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword,
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                tabIndex={-1}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />

                            {/* Підтвердження пароля */}
                            <Controller
                                name="confirmPassword"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel
                                            htmlFor="confirmPassword"
                                            aria-invalid={fieldState.invalid}
                                        >
                                            Підтвердіть пароль
                                        </FieldLabel>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            {...field}
                                            aria-invalid={fieldState.invalid}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                        </div>
                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <Button
                    type="submit"
                    form="register-form"
                    disabled={isSubmitting}
                    className="w-full"
                >
                    {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {isSubmitting ? "Реєстрація..." : "Створити акаунт"}
                </Button>
                <div className="flex text-center">
                    <Label>Вже є акаунт?</Label>
                    <Button
                        className="p-1"
                        variant="link"
                        onClick={() => router.push("/login")}
                    >
                        Увійти
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}
