import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { QueryProvider } from "@/provider/QueryProvider"
import { AuthProvider } from "@/provider/AuthProvider"
import { Toaster } from "@/components/ui/sonner"
import { ChatWsProvider } from "@/provider/chat-ws-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Kitypes",
    description: "",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="uk">
            <body className={`${inter.className} min-h-screen`}>
                <QueryProvider>
                    <AuthProvider>
                        <ChatWsProvider />
                        {children}
                    </AuthProvider>
                </QueryProvider>

                <Toaster position="bottom-right" richColors />
            </body>
        </html>
    )
}
