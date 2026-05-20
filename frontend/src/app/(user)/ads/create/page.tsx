import { CreateAd } from "@/components/features/create-ad/create-ad";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Створення оголошення",
    description: "Додайте нове оголошення про тваринку на KityPes",
};

export default function CreateAdPage() {
    return <CreateAd />
}
