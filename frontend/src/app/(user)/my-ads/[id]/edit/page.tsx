import { EditAd } from "@/components/features/edit-ad/edit-ad"

export default async function EditAdPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    return <EditAd adId={id} />
}
