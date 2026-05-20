import { EditAd } from "@/components/features/edit-ad/edit-ad"
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Редагування оголошення",
};

export default async function EditAdPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    return <EditAd adId={id} />
}
