"use client"

import { useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { PawPrint, X } from "lucide-react"

interface NewMessageToastProps {
    authorName: string
    adTitle: string
    content: string
    conversationId: string
    toastId: string | number
}

export function NewMessageToast({ authorName, adTitle, content, conversationId, toastId }: NewMessageToastProps) {
    const router = useRouter()
    const dragStart = useRef({ x: 0, y: 0 })

    const handlePointerDown = (e: React.PointerEvent) => {
        dragStart.current = { x: e.clientX, y: e.clientY }
    }

    const handleClick = (e: React.MouseEvent) => {
        const dx = Math.abs(e.clientX - dragStart.current.x)
        const dy = Math.abs(e.clientY - dragStart.current.y)

        if (dx > 10 || dy > 10) return

        toast.dismiss(toastId)
        router.push(`/messages/${conversationId}`)
    }

    const handleDismiss = (e: React.MouseEvent) => {
        e.stopPropagation()
        toast.dismiss(toastId)
    }

    return (
        <div
            onPointerDown={handlePointerDown}
            onClick={handleClick}
            className="relative flex items-start gap-3 w-[356px] max-w-full bg-white border border-gray-100 shadow-2xl rounded-2xl p-4 cursor-pointer group hover:bg-primary/5 transition-colors pointer-events-auto overflow-hidden"
        >
            <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors z-10 cursor-pointer"
            >
                <X className="w-4 h-4" />
            </button>

            <div className="shrink-0 bg-primary/10 p-2.5 rounded-full text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm mt-1">
                <PawPrint className="w-5 h-5 animate-pulse" />
            </div>

            <div className="flex flex-col flex-1 min-w-0 pr-6">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-extrabold text-gray-900 text-[15px] truncate">
                        {authorName}
                    </span>
                </div>
                {adTitle && (
                    <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-md font-bold truncate w-max max-w-full border border-primary/20 mb-1.5">
                        {adTitle}
                    </span>
                )}
                <p className="text-[13px] text-gray-600 line-clamp-2 leading-snug">
                    {content}
                </p>
            </div>
        </div>
    )
}
