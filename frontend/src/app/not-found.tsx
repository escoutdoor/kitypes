import Link from "next/link";
import { PawPrint, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in zoom-in-95 duration-500">

            <div className="p-8 bg-primary/10 rounded-full mb-8 shadow-inner border border-primary/20">
                <PawPrint
                    className="h-16 w-16 text-primary animate-[pulse_3s_ease-in-out_infinite]"
                />
            </div>

            <div className="space-y-3 mb-8">
                <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                    Ой, тут нікого немає
                </h2>
                <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                    Схоже, ця сторінка втекла на прогулянку. Перевірте адресу або поверніться на головну.
                </p>
            </div>

            <Button asChild size="lg" className="rounded-full px-8 cursor-pointer shadow-md h-12 hover:shadow-lg transition-all">
                <Link href="/" className="flex items-center gap-2">
                    <Home className="h-4 w-4" /> Повернутися додому
                </Link>
            </Button>
        </div>
    );
}
