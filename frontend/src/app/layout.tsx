import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { QueryProvider } from "@/provider/QueryProvider"
import { AuthProvider } from "@/provider/AuthProvider"
import { Toaster } from "@/components/ui/sonner"
import { ChatWsProvider } from "@/provider/chat-ws-provider"
import { TooltipProvider } from "@/components/ui/tooltip"

const inter = Inter({ subsets: ["latin"] })

// viewport та metadata відповідають за SEO та PWA-оптимізацію.
// metadataBase використовується для формування абсолютних OpenGraph/Twitter URL.
export const viewport: Viewport = {
    themeColor: "#ffffff",
    colorScheme: "light",
}

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    title: {
        default: "KityPes — Платформа для адопції тварин",
        template: "%s | KityPes",
    },
    description: "Шукаєте пухнастого друга? KityPes — це безпечна та зручна платформа для пошуку та прилаштування домашніх улюбленців в Україні. Знайдіть свого вірного друга вже сьогодні!",
    keywords: [
        "адопція тварин", "взяти кота", "взяти собаку", "притулок для тварин",
        "тварини в добрі руки", "KityPes", "допомога тваринам", "волонтери тварини"
    ],
    authors: [{ name: "KityPes Team" }],
    creator: "KityPes",
    publisher: "KityPes",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        title: "KityPes — Платформа для адопції тварин",
        description: "Безпечний сервіс, що з'єднує тих, хто шукає домашнього улюбленця, з волонтерами та притулками.",
        url: "/",
        siteName: "KityPes",
        locale: "uk_UA",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "KityPes — Платформа для адопції тварин",
        description: "Безпечний сервіс, що з'єднує тих, хто шукає домашнього улюбленця, з волонтерами та притулками.",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
}

// RootLayout обгортає застосунок провайдерами:
// QueryProvider — кешування серверного стану (React Query);
// AuthProvider — глобальний стан автентифікації;
// ChatWsProvider — WebSocket-з'єднання для чату (ініціалізується глобально);
// TooltipProvider — система підказок Radix UI.
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
                        <TooltipProvider>
                            <ChatWsProvider />
                            {children}
                        </TooltipProvider>
                    </AuthProvider>
                </QueryProvider>

                <Toaster position="bottom-right" richColors />
            </body>
        </html>
    )
}
