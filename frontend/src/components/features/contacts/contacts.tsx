"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Mail, MessageCircleQuestion, Bug, Send, Loader2, CheckCircle2, MessageCircle } from "lucide-react"
import { toast } from "sonner"
import { isAxiosError } from "axios"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

import { useSendSupportMessage } from "@/hook/useSupport"
import { useProfile } from "@/hook/useProfile"
import { useAuthStore } from "@/store/auth.store"
import { faqs } from "./contacts.data"

const SUBJECTS = {
    ACCOUNT: "Проблема з акаунтом",
    BUG: "Технічна помилка (Баг)",
    APPEAL: "Апеляція модерації",
    PARTNERSHIP: "Співпраця / Ідеї",
    OTHER: "Інше питання",
} as const

const supportSchema = z.object({
    subject: z.string().min(1, "Оберіть тему звернення"),
    email: z.email("Введіть правильний email"),
    message: z.string().min(10, "Опишіть проблему детальніше (мінімум 10 символів)").max(2000, "Максимум 2000 символів"),
})

type SupportFormValues = z.infer<typeof supportSchema>

export default function Contacts() {
    const { user } = useProfile()
    const { isAuthenticated } = useAuthStore()
    const { mutateAsync: sendMessage, isPending } = useSendSupportMessage()
    const [isSuccess, setIsSuccess] = useState(false)

    const { control, handleSubmit } = useForm<SupportFormValues>({
        resolver: zodResolver(supportSchema),
        values: {
            subject: "",
            email: user?.email || "",
            message: "",
        },
        mode: "onBlur"
    })

    const onSubmit = async (data: SupportFormValues) => {
        try {
            await sendMessage(data)
            setIsSuccess(true)
            toast.success("Ваш запит успішно надіслано!")
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 429) {
                toast.error("Ви надіслали забагато запитів. Зачекайте трохи перед наступною спробою.")
            } else {
                toast.error("Не вдалося надіслати запит. Спробуйте пізніше.")
            }
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 animate-in fade-in duration-500">

            {/* Hero */}
            <div className="mb-14 space-y-5 text-center sm:text-left">
                <Badge variant="secondary" className="mb-2 px-3 py-1 text-sm font-medium">
                    Контакти та Підтримка
                </Badge>
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
                    Зв'яжіться з нами
                </h1>
                <p className="text-lg text-gray-600 max-w-3xl font-medium leading-relaxed mx-auto sm:mx-0">
                    Маєте питання, цікаву пропозицію щодо співпраці або знайшли технічну проблему?
                    Оберіть зручний спосіб зв'язку — ми завжди відкриті до діалогу і готові допомогти.
                </p>
            </div>

            <Separator className="mb-12" />

            {/* Основний блок: Форма зліва, Картки справа */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">

                {/* ЛІВА КОЛОНКА: Форма (7 колонок) */}
                <div className="lg:col-span-7">
                    <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-6">
                        Надіслати запит
                    </h2>

                    {isSuccess ? (
                        <Card className="border-emerald-100 bg-emerald-50/50 shadow-sm text-center p-10 h-full flex flex-col justify-center items-center">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-emerald-900 mb-3">Запит прийнято!</h3>
                            <p className="text-emerald-800/80 font-medium max-w-md mx-auto mb-8">
                                Дякуємо за звернення. Наша команда розгляне його та надішле відповідь на вказаний вами email.
                            </p>
                            <Button variant="outline" className="bg-white cursor-pointer" onClick={() => setIsSuccess(false)}>
                                Написати ще одне повідомлення
                            </Button>
                        </Card>
                    ) : (
                        <Card className="border-gray-200/60 shadow-sm bg-white">
                            <CardContent className="p-6 sm:p-8">
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <FieldGroup>
                                        <Controller
                                            name="subject"
                                            control={control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel>Тема звернення</FieldLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className="h-11 bg-gray-50/50 cursor-pointer">
                                                            <SelectValue placeholder="Оберіть тему" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Object.entries(SUBJECTS).map(([key, label]) => (
                                                                <SelectItem key={key} value={label} className="cursor-pointer">{label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />

                                        <Controller
                                            name="email"
                                            control={control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel>Ваш Email для відповіді</FieldLabel>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                        <Input
                                                            className="pl-9 h-11 bg-gray-50/50"
                                                            placeholder="name@example.com"
                                                            {...field}
                                                        />
                                                    </div>
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                    <p className="text-[13px] text-muted-foreground mt-1.5 font-medium">
                                                        {isAuthenticated
                                                            ? "Ми автоматично підставили email вашого акаунту, але ви можете вказати інший."
                                                            : "На цю адресу ми надішлемо вам відповідь."}
                                                    </p>
                                                </Field>
                                            )}
                                        />

                                        <Controller
                                            name="message"
                                            control={control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel>Повідомлення</FieldLabel>
                                                    <Textarea
                                                        className="min-h-[140px] resize-y bg-gray-50/50"
                                                        placeholder="Опишіть вашу ситуацію детально. Якщо це баг — вкажіть, як його відтворити."
                                                        {...field}
                                                    />
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />
                                    </FieldGroup>

                                    <Button type="submit" disabled={isPending} className="w-full h-11 font-bold text-base shadow-sm cursor-pointer">
                                        {isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                        Надіслати запит
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* ПРАВА КОЛОНКА: Альтернативні канали (5 колонок) */}
                <div className="lg:col-span-5 flex flex-col space-y-4 mt-10 lg:mt-0">
                    <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">
                        Інші канали
                    </h2>

                    {/* Telegram */}
                    <Card className="border shadow-none hover:shadow-sm transition-shadow">
                        <CardContent className="p-5 flex items-center gap-4 h-full">
                            <div className="p-3 rounded-xl bg-sky-50 text-sky-600 shrink-0">
                                <MessageCircle className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-base text-gray-900 mb-1">Telegram</h3>
                                <p className="text-[13px] text-muted-foreground leading-relaxed mb-3">
                                    Найшвидший спосіб для вирішення термінових питань.
                                </p>
                                <Button variant="outline" size="sm" className="w-full font-semibold text-sky-600 hover:text-sky-700 hover:bg-sky-50" asChild>
                                    <a href="https://t.me/escoutdoor" target="_blank" rel="noopener noreferrer">
                                        Написати в Telegram
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Report Bug / GitHub */}
                    <Card className="border shadow-none hover:shadow-sm transition-shadow">
                        <CardContent className="p-5 flex items-center gap-4 h-full">
                            <div className="p-3 rounded-xl bg-gray-100 text-gray-800 shrink-0">
                                <Bug className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-base text-gray-900 mb-1">GitHub Issues</h3>
                                <p className="text-[13px] text-muted-foreground leading-relaxed mb-3">
                                    Знайшли баг? Відкрийте Issue у нашому репозиторії.
                                </p>
                                <Button variant="outline" size="sm" className="w-full font-semibold" asChild>
                                    <a href="https://github.com/escoutdoor/kitypes/issues" target="_blank" rel="noopener noreferrer">
                                        Створити Issue
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Email */}
                    <Card className="border shadow-none hover:shadow-sm transition-shadow">
                        <CardContent className="p-5 flex items-center gap-4 h-full">
                            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-base text-gray-900 mb-1">Прямий Email</h3>
                                <p className="text-[13px] text-muted-foreground leading-relaxed mb-3">
                                    Для офіційних запитів та пропозицій співпраці.
                                </p>
                                <Button variant="outline" size="sm" className="w-full font-semibold" asChild>
                                    <a href="mailto:vanap387@gmail.com">
                                        vanap387@gmail.com
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Separator className="mb-16" />

            {/* FAQ */}
            <div className="mb-16 bg-white border rounded-3xl p-6 sm:p-10 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                        <MessageCircleQuestion className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
                        Часті запитання (FAQ)
                    </h2>
                </div>
                <p className="text-muted-foreground text-[15px] mb-8">
                    Можливо, відповідь на ваше питання вже тут.
                </p>

                <Accordion type="single" collapsible className="w-full space-y-3">
                    {faqs.map((faq, idx) => (
                        <AccordionItem
                            key={idx}
                            value={`item-${idx}`}
                            className="border border-b border-b-gray-200 rounded-xl px-5 py-1 bg-gray-50/50 data-[state=open]:bg-white data-[state=open]:shadow-sm transition-all"
                        >
                            <AccordionTrigger className="text-left font-semibold text-[15px] hover:no-underline hover:text-primary">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed text-[14px]">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                    <AccordionItem value=""></AccordionItem>
                </Accordion>
            </div>

        </div>
    )
}
