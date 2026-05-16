import type { Metadata } from "next"
import { PublicUserView } from "@/components/features/public-user/public-user-view"

export const metadata: Metadata = {
    title: "Користувач | Kitypes",
    description: "Профіль користувача та його оголошення на Kitypes",
}

export default async function PublicUserPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    return (
        <div className="min-h-screen bg-gray-50/30 pb-20">
            <PublicUserView userId={id} />
        </div>
    )
}
