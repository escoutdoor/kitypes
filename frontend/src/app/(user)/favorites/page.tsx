import { FavoritesList } from "@/components/features/favorite-list/favorite-list"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Обрані оголошення | KityPes",
    description: "Ваш список збережених хвостиків.",
}

export default function FavoritesPage() {
    return <FavoritesList />
}
