import { Mail, MessageCircle, MessageCircleQuestion, Bug } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
    {
        question: "Як подати заявку на верифікацію волонтера або притулку?",
        answer: "Після реєстрації перейдіть у свій профіль і знайдіть розділ «Верифікація». Завантажте необхідні документи та оберіть бажаний статус. Заявка буде розглянута адміністрацією найближчим часом.",
    },
    {
        question: "Чи можна розмістити оголошення без верифікації?",
        answer: "Ні. Публікація оголошень доступна лише для верифікованих волонтерів і притулків. Це наш головний принцип, який забезпечує безпеку та довіру для людей, які шукають тварину.",
    },
    {
        question: "Як написати автору оголошення?",
        answer: "На сторінці оголошення є кнопка для початку чату з автором. Для використання вбудованого месенджера потрібно бути авторизованим користувачем.",
    },
    {
        question: "Що означають статуси оголошення?",
        answer: "«Відкрите» — тварина активно шукає новий дім, оголошення актуальне. «Закрите» — оголошення знято автором (тварина знайшла дім або з інших причин).",
    },
    {
        question: "Як поскаржитись на сумнівне оголошення або шахрая?",
        answer: "На сторінці кожного оголошення є можливість подати скаргу. Адміністрація розглядає всі звернення та може заблокувати акаунт порушника.",
    },
    {
        question: "Чи безкоштовна платформа?",
        answer: "Так, KityPes повністю безкоштовний для всіх користувачів — як для тих, хто шукає улюбленця, так і для волонтерів та організацій.",
    },
    {
        question: "Як видалити свій акаунт?",
        answer: "Видалити акаунт можна в налаштуваннях профілю. Зверніть увагу: разом з акаунтом будуть назавжди видалені всі ваші активні оголошення, історія чатів та збережені тварини.",
    },
]

export default function Contacts() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in duration-500">

            {/* Hero */}
            <div className="mb-16 space-y-4 text-center sm:text-left">
                <Badge variant="secondary" className="mb-2">
                    Контакти
                </Badge>
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 leading-tight md:text-5xl">
                    Зв'яжіться з нами
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl font-medium leading-relaxed mx-auto sm:mx-0">
                    Маєте питання, цікаву пропозицію щодо співпраці або знайшли технічну проблему?
                    Оберіть зручний спосіб зв'язку — ми завжди відкриті до діалогу.
                </p>
            </div>

            <Separator className="mb-16" />

            {/* Контакти (Грід 3 колонки) */}
            <div className="mb-16">
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-6">
                    Як зв'язатись
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* Email */}
                    <Card className="border shadow-none hover:shadow-sm transition-shadow">
                        <CardContent className="p-6 space-y-4 flex flex-col h-full">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-base text-gray-900">Електронна пошта</h3>
                            </div>
                            <p className="text-[13px] text-muted-foreground leading-relaxed flex-1">
                                Пишіть з будь-яких питань щодо пропозицій співпраці, скарг на шахраїв або якщо не можете відновити доступ до акаунту.
                            </p>
                            <Button variant="outline" className="w-full font-semibold" asChild>
                                <a href="mailto:vanap387@gmail.com">
                                    vanap387@gmail.com
                                </a>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Telegram */}
                    <Card className="border shadow-none hover:shadow-sm transition-shadow">
                        <CardContent className="p-6 space-y-4 flex flex-col h-full">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600">
                                    <MessageCircle className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-base text-gray-900">Telegram</h3>
                            </div>
                            <p className="text-[13px] text-muted-foreground leading-relaxed flex-1">
                                Найшвидший спосіб зв'язку для вирішення термінових питань або отримання підтримки від адміністрації.
                            </p>
                            <Button variant="outline" className="w-full font-semibold text-sky-600 hover:text-sky-700 hover:bg-sky-50" asChild>
                                <a href="https://t.me/escoutdoor" target="_blank" rel="noopener noreferrer">
                                    Написати в Telegram
                                </a>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Report Bug / GitHub */}
                    <Card className="border shadow-none hover:shadow-sm transition-shadow">
                        <CardContent className="p-6 space-y-4 flex flex-col h-full">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-gray-100 text-gray-800">
                                    <Bug className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-base text-gray-900">GitHub Issues</h3>
                            </div>
                            <p className="text-[13px] text-muted-foreground leading-relaxed flex-1">
                                Знайшли технічну проблему на сайті або щось працює не так, як очікувалося? Відкрийте Issue.
                            </p>
                            <Button variant="outline" className="w-full font-semibold" asChild>
                                <a
                                    href="https://github.com/escoutdoor/kitypes/issues"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Створити Issue
                                </a>
                            </Button>
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
                    <AccordionItem value=""></AccordionItem> {/*just to have border-b*/}
                </Accordion>
            </div>

        </div>
    )
}
