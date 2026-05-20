import About from "@/components/features/about/about"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Про нас",
    description: "Дізнайтеся про місію KityPes. Ми з'єднуємо тих, хто шукає домашнього улюбленця, з волонтерами та притулками по всій Україні.",
}

export default function AboutPage() {
    return <About />
}
