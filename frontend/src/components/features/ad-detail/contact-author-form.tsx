"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Mail, Send, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { usePublishMessage } from "@/hook/usePublishMessage"
import { useAuthStore } from "@/store/auth.store"

const firstMessageSchema = z.object({
    content: z.string().min(1, "Напишіть щось").max(2000, "Максимум 2000 символів")
})
type FirstMessageValues = z.infer<typeof firstMessageSchema>

export function ContactAuthorForm({ adId }: { adId: string }) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)

    const { isAuthenticated } = useAuthStore()
    const { mutate: publishMessage, isPending } = usePublishMessage()

    const { register, handleSubmit, reset, formState: { errors, isValid } } = useForm<FirstMessageValues>({
        resolver: zodResolver(firstMessageSchema),
        defaultValues: { content: "" },
        mode: "onChange"
    })

    const handleOpenRequest = () => {
        if (!isAuthenticated) {
            toast.info("Бажаєте написати власнику?", {
                description: "Увійдіть у свій акаунт, щоб почати спілкування щодо хвостика.",
                action: { label: "Увійти", onClick: () => router.push("/login") },
            })
            return
        }
        setIsOpen(true)
    }

    const onSendMessage = (data: FirstMessageValues) => {
        publishMessage(
            { adId: adId, content: data.content.trim() },
            {
                onSuccess: () => {
                    toast.success("Повідомлення успішно надіслано!")
                    reset()
                    router.push("/messages")
                },
                onError: () => toast.error("Не вдалося відправити повідомлення")
            }
        )
    }

    if (!isOpen) {
        return (
            <Button
                size="lg"
                variant="outline"
                className="w-full text-base font-semibold bg-white hover:bg-primary/5 hover:text-primary hover:border-primary/30 rounded-xl cursor-pointer border-gray-200 transition-colors shadow-sm"
                onClick={handleOpenRequest}
            >
                <Mail className="h-5 w-5 mr-2" /> Написати повідомлення
            </Button>
        )
    }

    return (
        <form
            onSubmit={handleSubmit(onSendMessage)}
            className="animate-in fade-in slide-in-from-bottom-2 duration-300 p-5 bg-white border border-gray-100 shadow-md rounded-2xl flex flex-col gap-4"
        >
            <div className="flex flex-col gap-1.5">
                <Textarea
                    {...register("content")}
                    placeholder="Добрий день, хочу запитати щодо хвостика..."
                    className={cn(
                        "bg-gray-50/50 resize-none text-[15px] min-h-[100px] p-3.5 rounded-xl border-gray-200 transition-all custom-scrollbar focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary",
                        errors.content ? "border-red-300 focus-visible:ring-red-100 focus-visible:border-red-400" : ""
                    )}
                />
                {errors.content && (
                    <p className="text-[13px] text-red-500 font-medium px-1 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-red-500 shrink-0"></span>
                        {errors.content.message}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                    type="button"
                    variant="ghost"
                    className="w-full h-10 cursor-pointer rounded-xl hover:bg-gray-100 font-medium text-gray-600 flex items-center justify-center"
                    onClick={() => { setIsOpen(false); reset(); }}
                    disabled={isPending}
                >
                    Скасувати
                </Button>

                <Button
                    type="submit"
                    className="w-full h-10 px-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer rounded-xl flex items-center justify-center gap-1.5 font-semibold text-sm transition-transform active:scale-[0.98]"
                    disabled={!isValid || isPending}
                >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : <Send className="h-4 w-4 shrink-0 relative -ml-[2px] mt-[2px]" />}
                    <span className="truncate">Відправити</span>
                </Button>
            </div>
        </form>
    )
}
