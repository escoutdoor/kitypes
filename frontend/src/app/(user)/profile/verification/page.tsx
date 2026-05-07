import Verification from "@/components/features/verification/verification";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Верифікація акаунту | Kitypes",
    description: "Отримайте статус волонтера або притулку",
};

export default function Page() {
    return <Verification />;
}
