"use client"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    FieldGroup,
    Field,
    FieldLabel,
    FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import z from "zod"
import { useState } from "react"
import { useAuthStore } from "@/store/auth.store"

const formSchema = z.object({
    email: z.email({ message: "Введіть вашу email адресу" }),
    password: z
        .string()
        .min(1, "Введіть будь ласка пароль"),
})

const Login = () => {
    const router = useRouter()
    const login = useAuthStore((state) => state.login)
    const [showPassword, setShowPassword] = useState(false)

    const {
        control,
        handleSubmit,
        setError,
        formState: { isSubmitting, errors },
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "", password: "" },
        mode: "onBlur",
    })

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            await login(data)
            router.push("/")
        } catch (err: any) {
            const message = err.response?.data?.message || "Неправильний email або пароль"
            setError("root", { type: "manual", message: message })
        }
    }

    return (
        <Card className="w-full max-w-md shadow-lg">
            <CardHeader>
                <CardTitle>Вхід у акаунт</CardTitle>
                <CardDescription>
                    Введіть будь ласка дані для входу
                </CardDescription>
                <CardAction>
                    <Button
                        onClick={() => router.push("/register")}
                        variant="link"
                        className="px-0"
                    >
                        Реєстрація
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                <form id="login-form" onSubmit={handleSubmit(onSubmit)}>
                    <FieldGroup>
                        {errors.root && (
                            <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 font-medium border border-red-100">
                                {errors.root.message}
                            </div>
                        )}

                        {/* email */}
                        <Controller
                            name="email"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="user-email">
                                        Email
                                    </FieldLabel>
                                    <Input
                                        id="user-email"
                                        type="email"
                                        placeholder="name@example.com"
                                        className="h-11 bg-white focus-visible:bg-white text-base shadow-sm border-gray-200"
                                        {...field}
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        {/* password */}
                        <Controller
                            name="password"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <div className="flex items-center justify-between w-full">
                                        <FieldLabel htmlFor="password">
                                            Пароль
                                        </FieldLabel>
                                        <Link
                                            href="/forgot-password"
                                            className="text-[13px] font-semibold text-primary hover:text-primary/80 transition-colors"
                                            tabIndex={-1}
                                        >
                                            Забули пароль?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="h-11 pr-10 bg-white focus-visible:bg-white text-base shadow-sm border-gray-200"
                                            {...field}
                                            aria-invalid={fieldState.invalid}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            tabIndex={-1}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full h-11 font-bold text-base"
                    form="login-form"
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Вхід...
                        </>
                    ) : (
                        "Увійти"
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}

export default Login
