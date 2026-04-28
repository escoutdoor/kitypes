"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heart } from "lucide-react"
import { toast } from "sonner"

import { useToggleFavorite } from "@/hook/useToggleFavorite"
import { useAuthStore } from "@/store/auth.store"

interface FavoriteButtonProps {
    adId: string
    initialIsFavorite: boolean
    className?: string
}

export function FavoriteButton({ adId, initialIsFavorite, className = "" }: FavoriteButtonProps) {
    const router = useRouter()
    const { mutate: toggleFavorite } = useToggleFavorite()
    const { isAuthenticated } = useAuthStore()

    const [isFav, setIsFav] = useState(initialIsFavorite)

    useEffect(() => {
        setIsFav(initialIsFavorite)
    }, [initialIsFavorite])

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!isAuthenticated) {
            toast.info("Хочете зберегти хвостика?", {
                description: "Увійдіть у свій акаунт, щоб додавати оголошення в обране.",
                action: {
                    label: "Увійти",
                    onClick: () => router.push("/login"),
                },
            })
            return
        }

        const previousState = isFav
        const newState = !isFav

        setIsFav(newState)

        toggleFavorite(
            { adId, isCurrentlyFavorite: previousState },
            {
                onError: () => {
                    setIsFav(previousState)
                    toast.error("Не вдалося оновити обрані. Спробуйте ще раз.")
                }
            }
        )
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`flex items-center justify-center p-2.5 rounded-full transition-all active:scale-90 shadow-sm backdrop-blur-md cursor-pointer ${isFav
                ? "bg-red-50 hover:bg-red-100 text-red-500"
                : "bg-white/90 hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                } ${className}`}
            aria-label={isFav ? "Видалити з обраного" : "Додати в обране"}
        >
            <Heart className={`h-5 w-5 transition-transform ${isFav ? "fill-current scale-110" : ""}`} />
        </button>
    )
}
