import { Metadata, ResolvingMetadata } from "next"
import { AdDetail } from "@/components/features/ad-detail/ad-detail"
import { EnrichedAd } from "@/service/ad/ad.interface"
import { notFound } from "next/navigation"

async function getAdServer(id: string): Promise<EnrichedAd | null> {
    try {
        const baseUrl = process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3800"
        const res = await fetch(`${baseUrl}/v1/ads/${id}`, {
            next: { revalidate: 60 }
        })
        if (!res.ok) return null
        const data = await res.json()
        return data.advertisement
    } catch (error) {
        console.error("Failed to fetch ad metadata:", error)
        return null
    }
}

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params
    const ad = await getAdServer(id)

    if (!ad) {
        return { title: "Оголошення не знайдено" }
    }

    const previousImages = (await parent).openGraph?.images || []
    const petTypeString = ad.petType === 1 ? "Песик" : ad.petType === 2 ? "Котик" : "Тваринка"
    const description = `${petTypeString} шукає дім. Місто: ${ad.city}. ${ad.description.substring(0, 100)}...`

    const adImages = ad.imageUrls && ad.imageUrls.length > 0
        ? [ad.imageUrls[0], ...previousImages]
        : previousImages

    return {
        title: ad.title,
        description: description,
        openGraph: {
            title: `${ad.title} | KityPes`,
            description: description,
            url: `/ads/${ad.id}`,
            images: adImages,
            type: "article",
            publishedTime: ad.createdAt,
            authors: [ad.authorName],
        },
        twitter: {
            card: "summary_large_image",
            title: ad.title,
            description: description,
            images: adImages,
        }
    }
}

export default async function PublicAdPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const ad = await getAdServer(id)

    if (!ad) {
        notFound()
    }

    return <AdDetail adId={id} initialData={ad} />
}
