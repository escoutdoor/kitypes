import { Metadata } from "next"
import Register from "@/components/features/register/register"

export const metadata: Metadata = {
    title: "Реєстрація",
    description: "Створіть акаунт на KityPes та допоможіть безпритульним тваринам знайти дім.",
}

export default function RegisterPage() {
    return <Register />
}
