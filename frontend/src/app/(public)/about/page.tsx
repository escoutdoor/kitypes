import type { Metadata } from "next"
import { About } from "@/components/features/about/about"

export const metadata: Metadata = {
    title: "Про нас | KityPes",
    description: "KityPes — платформа для адопції тварин в Україні. Дізнайтесь про нашу місію та як ми допомагаємо тваринам знайти новий дім.",
}

export default function AboutPage() {
    return <About />
}
