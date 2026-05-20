import { Metadata } from "next"
import Home from "@/components/features/home/home"

export const metadata: Metadata = {
    // i use default title there
    description: "Сотні тваринок чекають на свою родину. KityPes — це зручний та безпечний сервіс для пошуку домашніх улюбленців. Знайди свого вірного друга вже сьогодні!",
}

export default function HomePage() {
    return <Home />
}
