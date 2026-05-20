import { Suspense } from "react"
import { AdList } from "@/components/features/ad-list/ad-list"
import { Metadata } from "next"

function AdsPageFallback() {
    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
            <div className="mb-8 rounded-3xl border bg-muted/30 p-8">
                <div className="h-8 w-72 animate-pulse rounded bg-muted mb-3" />
                <div className="h-5 w-96 max-w-full animate-pulse rounded bg-muted" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[270px_1fr] gap-8">
                <div className="rounded-2xl border p-6 space-y-4">
                    <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-10 w-full animate-pulse rounded bg-muted" />
                    <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                    <div className="h-10 w-full animate-pulse rounded bg-muted" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="space-y-3">
                            <div className="h-60 w-full animate-pulse rounded-2xl bg-muted" />
                            <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export const metadata: Metadata = {
    title: "Каталог тварин",
    description: "Переглядайте сотні оголошень про тварин, які шукають родину в Україні. Зручний пошук за містом, породою, віком та статтю на KityPes.",
}

export default function Page() {
    return (
        <Suspense fallback={<AdsPageFallback />}>
            <AdList />
        </Suspense>
    )
}
