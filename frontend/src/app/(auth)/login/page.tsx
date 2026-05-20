import { Metadata } from "next"
import Login from "@/components/features/login/login"

export const metadata: Metadata = {
    title: "Вхід в акаунт",
    description: "Увійдіть до свого акаунту KityPes, щоб розміщувати оголошення або зберігати обраних улюбленців.",
}

export default function LoginPage() {
    return <Login />
}
