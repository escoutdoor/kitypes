import { Metadata } from "next"
import { MessagesLayout } from "@/components/features/messages/messages-layout"

export const metadata: Metadata = {
    title: "Повідомлення | KityPes",
    description: "Ваші чати та спілкування щодо хвостиків.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return <MessagesLayout>{children}</MessagesLayout>
}
