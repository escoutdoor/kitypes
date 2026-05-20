import Contacts from "@/components/features/contacts/contacts"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Контакти та Підтримка",
    description: "Маєте питання або пропозиції щодо платформи KityPes? Зв'яжіться з нашою службою підтримки.",
}

export default function ContactsPage() {
    return <Contacts />
}
