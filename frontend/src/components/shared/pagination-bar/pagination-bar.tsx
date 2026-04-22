"use client"

import { Button } from "@/components/ui/button"

type Props = {
    page: number
    totalPages: number
    onPageChangeAction: (p: number) => void
}

export function PaginationBar({ page, totalPages, onPageChangeAction }: Props) {
    if (totalPages <= 1) return null

    const handlePageChange = (newPage: number) => {
        onPageChangeAction(newPage)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    return (
        <div className="flex items-center justify-center gap-2 pt-8">
            <Button variant="outline" disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>
                Попередня
            </Button>

            <span className="text-sm font-medium text-muted-foreground px-4">
                Сторінка {page} з {totalPages}
            </span>

            <Button variant="outline" disabled={page >= totalPages} onClick={() => handlePageChange(page + 1)}>
                Наступна
            </Button>
        </div>
    )
}
