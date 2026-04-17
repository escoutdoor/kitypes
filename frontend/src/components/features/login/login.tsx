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
import { redirect } from "next/navigation"
import z from "zod"

const formSchema = z.object({
	email: z.email({ message: "Введіть вашу email адресу" }),
	password: z
		.string("Введіть будь ласка пароль")
		.min(8, "Пароль повинен бути не менше 8 символів")
		.max(50, "Пароль не може бути більше ніж 50 символів"),
})

const Login = () => {
	const {
		control,
		handleSubmit,
		formState: { isSubmitting },
	} = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { email: "", password: "" },
		mode: "onBlur",
	})

	const onSubmit = (data: z.infer<typeof formSchema>) => {
		console.log(data)
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
						onClick={() => redirect("/register")}
						variant="link"
					>
						Реєстрація
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent>
				<form id="login-form" onSubmit={handleSubmit(onSubmit)}>
					<FieldGroup>
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
