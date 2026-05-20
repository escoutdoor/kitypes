import { Metadata } from "next"
import { MessagesLayout } from "@/components/features/messages/messages-layout"

export const metadata: Metadata = {
    title: "Повідомлення",
    description: "Ваші чати та спілкування щодо тварин.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return <MessagesLayout>{children}</MessagesLayout>
}
