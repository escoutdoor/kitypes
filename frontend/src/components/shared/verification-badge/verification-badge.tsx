"use client"

import { BadgeCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface Props {
    role?: string
    showText?: boolean
    size?: "sm" | "default"
    className?: string
}

export function VerificationBadge({ role, showText = false, size = "default", className }: Props) {
    if (role !== "volunteer" && role !== "shelter" && role !== "admin") return null

    const label = role === "volunteer" ? "Перевірений волонтер" : role === "shelter" ? "Офіційний притулок" : "Адміністрація KityPes"
    const tooltipText = role === "volunteer" || role === "shelter"
        ? "Цей користувач надав документи та підтвердив свою особу адміністрації."
        : "Офіційний представник платформи."

    let iconSizeClass = "h-5 w-5"
    if (size === "sm") {
        iconSizeClass = "h-4 w-4"
    } else if (showText) {
        iconSizeClass = "h-4 w-4"
    }

    const badgeContent = (
        <div className={cn(
            "inline-flex items-center gap-1.5 transition-colors",
            showText ? "bg-blue-50 border border-blue-100 dark:bg-blue-950 dark:border-blue-900 px-2.5 py-1 rounded-full" : "",
            className
        )}>
            <BadgeCheck className={cn("text-blue-500 dark:text-blue-400 shrink-0", iconSizeClass)} />
            {showText && <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{label}</span>}
        </div>
    )

    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger type="button" className="cursor-help flex items-center focus:outline-none shrink-0">
                    {badgeContent}
                </TooltipTrigger>
                <TooltipContent
                    side="top"
                    sideOffset={8}
                    avoidCollisions={true}
                    collisionPadding={16}
                    className="w-[280px] p-3 text-center z-50 bg-popover text-popover-foreground shadow-xl border rounded-xl"
                >
                    <p className="font-bold text-[15px] mb-1.5">{label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{tooltipText}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
