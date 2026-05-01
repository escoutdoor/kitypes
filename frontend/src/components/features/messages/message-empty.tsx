"use client"

import { MessageSquareDashed } from "lucide-react"

export function MessagesEmpty() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/30 h-full">
            <div className="p-5 bg-white rounded-full shadow-sm border border-gray-100 mb-4">
                <MessageSquareDashed className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Оберіть чат</h3>
            <p className="text-muted-foreground text-center max-w-sm">
                Виберіть розмову зі списку ліворуч, щоб переглянути історію повідомлень або написати нове.
            </p>
        </div>
    )
}
