import Contacts from "@/components/features/contacts/contacts"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Контакти | KityPes",
    description: "KityPes — платформа для адопції тварин в Україні. Дізнатеся відповіді на свої запитання тут.",
}

export default function ContactsPage() {
    return <Contacts />
}
