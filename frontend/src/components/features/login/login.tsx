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
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import z from "zod"
import { useAuthStore } from "@/store/auth.store"

const formSchema = z.object({
    email: z.email({ message: "Введіть вашу email адресу" }),
    password: z
        .string("Введіть будь ласка пароль")
        .min(8, "Пароль повинен бути не менше 8 символів")
        .max(50, "Пароль не може бути більше ніж 50 символів"),
})

const Login = () => {
    const router = useRouter()
    const login = useAuthStore((state) => state.login)

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
        console.log(data)

        try {
            await login(data)
            router.push("/")
        } catch (err: any) {
            console.log(err.response?.data?.message)
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
                    >
                        Реєстрація
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                <form id="login-form" onSubmit={handleSubmit(onSubmit)}>
                    <FieldGroup>
                        {errors.root && (
                            <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
                                {errors.root.message}
                            </div>
                        )}

                        {/* email */}
                        <Controller
                            name="email"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="email">
                                        Email
                                    </FieldLabel>
                                    <Input
                                        id="user-email"
                                        placeholder="name@example.com"
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

                        <Controller
                            name="password"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="password">
                                        Пароль
                                    </FieldLabel>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
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
                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    form="login-form"
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                            Вхід...
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
