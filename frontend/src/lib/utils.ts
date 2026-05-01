import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatPetAge(months: number | null | undefined): string {
    if (months === null || months === undefined) return "Невідомо"
    if (months === 0) return "Менше місяця"

    const years = Math.floor(months / 12)
    const remMonths = months % 12

    const getYearWord = (y: number) => {
        const lastDigit = y % 10
        const lastTwoDigits = y % 100
        if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return "років"
        if (lastDigit === 1) return "рік"
        if (lastDigit >= 2 && lastDigit <= 4) return "роки"
        return "років"
    }

    const getMonthWord = (m: number) => {
        const lastDigit = m % 10
        const lastTwoDigits = m % 100
        if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return "місяців"
        if (lastDigit === 1) return "місяць"
        if (lastDigit >= 2 && lastDigit <= 4) return "місяці"
        return "місяців"
    }

    const parts = []
    if (years > 0) parts.push(`${years} ${getYearWord(years)}`)
    if (remMonths > 0) parts.push(`${remMonths} ${getMonthWord(remMonths)}`)

    return parts.join(" ")
}

export function formatChatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return ""

    try {
        const d = new Date(dateStr)
        const now = new Date()

        const isToday = d.getDate() === now.getDate() &&
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()

        if (isToday) {
            return new Intl.DateTimeFormat("uk-UA", { hour: "2-digit", minute: "2-digit" }).format(d)
        }
        return new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "short" }).format(d)
    } catch {
        return ""
    }
}
