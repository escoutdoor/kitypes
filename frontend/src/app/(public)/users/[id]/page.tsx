import type { Metadata, ResolvingMetadata } from "next"
import { PublicUserView } from "@/components/features/public-user/public-user-view"
import { PublicUserResponse } from "@/service/user/user.interface"
import { notFound } from "next/navigation"

async function getUserServer(id: string): Promise<PublicUserResponse | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3800"
        const res = await fetch(`${baseUrl}/v1/users/${id}`, {
            next: { revalidate: 120 }
        })
        if (!res.ok) return null
        return await res.json()
    } catch (error) {
        console.error("Failed to fetch user metadata:", error)
        return null
    }
}

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params
    const data = await getUserServer(id)

    if (!data || !data.user) {
        return { title: "Користувача не знайдено" }
    }

    const user = data.user
    const previousImages = (await parent).openGraph?.images || []
    const roleLabel = user.role === "shelter" ? "Притулок" : user.role === "volunteer" ? "Волонтер" : "Користувач"
    const fullName = `${user.firstName} ${user.lastName}`

    const description = `Профіль на KityPes. ${roleLabel}, що допомагає тваринам знайти новий дім. Перегляньте актуальні оголошення куратора.`
    const ogImages = user.avatarUrl ? [user.avatarUrl, ...previousImages] : previousImages

    return {
        title: `${fullName} (${roleLabel})`,
        description: description,
        openGraph: {
            title: `${fullName} | KityPes`,
            description: description,
            url: `/users/${user.id}`,
            type: "profile",
            images: ogImages,
        },
        twitter: {
            card: "summary",
            title: `${fullName} | KityPes`,
            description: description,
            images: ogImages,
        }
    }
}

export default async function PublicUserPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const data = await getUserServer(id)

    if (!data) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-gray-50/30 pb-20">
            <PublicUserView userId={id} initialData={data} />
        </div>
    )
}
