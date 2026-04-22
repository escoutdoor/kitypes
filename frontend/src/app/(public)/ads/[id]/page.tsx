import { AdDetail } from "@/components/features/ad-detail/ad-detail"

export default async function PublicAdPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    return <AdDetail adId={id} />
}
