import { ResetPassword } from "@/components/features/reset-password/reset-password";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Новий пароль",
    description: "Встановіть новий пароль для вашого акаунту KityPes.",
}

export default function ResetPasswordPage() {
    return <ResetPassword />
}
