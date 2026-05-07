"use client"

import Link from "next/link"
import {
    Heart,
    Search,
    ShieldCheck,
    MessageCircle,
    Bookmark,
    ArrowRight,
    PawPrint,
    Home,
    Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const features = [
    {
        icon: Search,
        title: "Централізований каталог",
        description:
            "Всі оголошення в одному місці. Фільтрація за видом, породою, віком, статтю та розташуванням — без зайвого шуму.",
    },
    {
        icon: ShieldCheck,
        title: "Верифікація волонтерів і притулків",
        description:
            "Організації та волонтери проходять перевірку. Ви одразу бачите, кому можна довіряти.",
    },
    {
        icon: MessageCircle,
        title: "Вбудований чат",
        description:
            "Домовляйтесь прямо на платформі — без переходу в соцмережі чи месенджери.",
    },
    {
        icon: Bookmark,
        title: "Збережені оголошення",
        description:
            "Зберігайте тварин, які сподобались, і повертайтесь до них у будь-який момент.",
    },
]

const steps = [
    {
        number: "01",
        title: "Знайдіть",
        description: "Перегляньте каталог або скористайтесь фільтрами — вид, вік, місто.",
    },
    {
        number: "02",
        title: "Напишіть",
        description: "Зв'яжіться з волонтером або притулком прямо через чат на сайті.",
    },
    {
        number: "03",
        title: "Зустріньтесь",
        description: "Познайомтесь з твариною і дайте їй новий дім.",
    },
]

export function About() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in duration-500">

            <div className="mb-16 space-y-4">
                <Badge variant="secondary" className="mb-2">
                    <PawPrint className="w-3 h-3 mr-1" />
                    Про KityPes
                </Badge>
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
                    Платформа, де тварини<br />знаходять новий дім
                </h1>
                <p className="text-lg text-muted-foreground max-w-4xl font-medium">
                    KityPes — це спеціалізований сервіс для адопції тварин в Україні. Ми
                    з'єднуємо тих, хто шукає домашнього улюбленця, з волонтерами та притулками,
                    які про них піклуються.
                </p>
            </div>

            <Separator className="mb-16" />

            <div className="mb-16">
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-4">
                    Чому це важливо
                </h2>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-3">
                    <p className="text-gray-800 leading-relaxed">
                        Після початку повномасштабного вторгнення кількість покинутих тварин в Україні
                        різко зросла. У тилових областях — на <strong>20–30%</strong>, серед
                        зооволонтерів — на <strong>60%</strong>, а в притулках прифронтових регіонів —
                        більш ніж на <strong>100%</strong>.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        Більшість із них — домашні тварини, яких господарі були змушені покинути під
                        час евакуації. Вони живі, здорові, звикли до людей — і чекають на новий дім.
                    </p>
                </div>
            </div>

            <div className="mb-16">
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-6">
                    Що ми вирішуємо
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {features.map((f) => (
                        <Card key={f.title} className="border shadow-none hover:shadow-sm transition-shadow">
                            <CardContent className="p-5 space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-md bg-gray-100">
                                        <f.icon className="w-4 h-4 text-gray-700" />
                                    </div>
                                    <h3 className="font-bold text-sm text-gray-900">{f.title}</h3>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {f.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <Separator className="mb-16" />

            <div className="mb-16">
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-6">
                    Для кого
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="rounded-xl border p-6 space-y-3">
                        <div className="flex items-center gap-2">
                            <Heart className="w-5 h-5 text-rose-500" />
                            <h3 className="font-bold text-gray-900">Шукаю тварину</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Переглядайте каталог, фільтруйте за своїми критеріями, зберігайте
                            оголошення та напряму спілкуйтесь з волонтерами.
                        </p>
                    </div>
                    <div className="rounded-xl border p-6 space-y-3">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-500" />
                            <h3 className="font-bold text-gray-900">Волонтер або притулок</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Публікуйте оголошення, проходьте верифікацію для підвищення довіри та
                            спілкуйтесь з потенційними власниками в одному місці.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-16">
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-6">
                    Як це працює
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {steps.map((step, i) => (
                        <div key={step.number} className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <span className="text-3xl font-extrabold text-gray-200 leading-none">
                                    {step.number}
                                </span>
                                {i < steps.length - 1 && (
                                    <div className="hidden sm:block mt-2">
                                        <ArrowRight className="w-4 h-4 text-gray-300 rotate-90 sm:rotate-0" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-bold text-gray-900">{step.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Separator className="mb-16" />

            <div className="mb-16">
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-4">
                    Як з'явився KityPes
                </h2>
                <div className="space-y-3 text-gray-700 leading-relaxed">
                    <p>
                        Ідея виникла з простого спостереження: людей, які хочуть взяти тварину,
                        багато — але знайти підходящу важко. Оголошення розкидані по групах,
                        чатах і сайтах; немає єдиного місця, де можна зручно шукати і
                        порівнювати.
                    </p>
                    <p>
                        Так з'явився KityPes — спроба зібрати все в одному місці і зробити
                        процес адопції простішим, зрозумілішим і безпечнішим для обох сторін.
                    </p>
                </div>
            </div>

            <div className="rounded-xl bg-gray-50 border p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="font-extrabold text-gray-900 text-lg">
                        Готові до дії?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Поверніться на головну і розпочніть пошук.
                    </p>
                </div>
                <Button asChild size="lg" className="shrink-0">
                    <Link href="/">
                        <Home className="w-4 h-4 mr-2" />
                        На головну
                    </Link>
                </Button>
            </div>

        </div>
    )
}
