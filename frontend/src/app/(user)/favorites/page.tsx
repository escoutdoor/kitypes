import { FavoritesList } from "@/components/features/favorite-list/favorite-list"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Обрані оголошення",
    description: "Ваш список збережених тварин.",
}

export default function FavoritesPage() {
    return <FavoritesList />
}
