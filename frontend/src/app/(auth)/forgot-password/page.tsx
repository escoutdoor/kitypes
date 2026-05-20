import { ForgotPassword } from "@/components/features/forgot-password/forgot-password";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Відновлення пароля",
    description: "Забули пароль до KityPes? Введіть свою електронну пошту для відновлення доступу.",
}

export default function ForgotPasswordPage() {
    return <ForgotPassword />
}
