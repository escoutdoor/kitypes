import { MyAdsList } from "@/components/features/my-ads-list/my-ads-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Мої оголошення",
    description: "Управління вашими оголошеннями на KityPes",
};

export default function MyAdsPage() {
    return <MyAdsList />
}
