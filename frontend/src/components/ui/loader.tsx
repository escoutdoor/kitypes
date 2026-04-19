import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
    fullScreen?: boolean;
}

export function Loader({ fullScreen = false }: LoaderProps) {
    return (
        <div className={cn(
            "flex items-center justify-center",
            fullScreen ? "min-h-screen bg-gray-50 text-gray-500" : "min-h-[60vh] text-primary"
        )}>
            <Loader2 className={cn(
                "animate-spin",
                fullScreen ? "h-8 w-8" : "h-10 w-10"
            )} />
        </div>
    );
}
