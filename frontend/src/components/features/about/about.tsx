import Link from "next/link"
import {
    Heart,
    Search,
    ShieldCheck,
    MessageCircle,
    Bookmark,
    PawPrint,
    Users,
    SearchCheck
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const features = [
    {
        icon: Search,
        title: "Централізований каталог",
        description: "Всі оголошення в одному місці. Фільтрація за видом, породою, віком, статтю та розташуванням — без зайвого шуму.",
    },
    {
        icon: ShieldCheck,
        title: "Верифікація волонтерів",
        description: "Організації та волонтери можуть пройти перевірку. Ви одразу бачите, кому можна довіряти.",
    },
    {
        icon: MessageCircle,
        title: "Вбудований чат",
        description: "Домовляйтесь прямо на платформі — без переходу в соцмережі чи сторонні месенджери.",
    },
    {
        icon: Bookmark,
        title: "Збережені оголошення",
        description: "Зберігайте тварин, які сподобались, і повертайтесь до них у будь-який момент в особистому кабінеті.",
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
        description: "Познайомтесь з твариною наживо і подаруйте їй новий дім.",
    },
]

export default function About() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in duration-500">

            {/* Hero Section */}
            <div className="mb-14 space-y-5 text-center sm:text-left">
                <Badge variant="secondary" className="mb-2 px-3 py-1 text-sm font-medium">
                    <PawPrint className="w-3 h-3 mr-1.5" />
                    Про KityPes
                </Badge>
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
                    Платформа, де тварини<br />знаходять новий дім
                </h1>
                <p className="text-lg text-gray-600 max-w-3xl font-medium leading-relaxed mx-auto sm:mx-0">
                    KityPes — це спеціалізований сервіс для адопції тварин в Україні.
                    Ми з'єднуємо тих, хто шукає домашнього улюбленця, з волонтерами та притулками,
                    які про них піклуються.
                </p>
            </div>

            <Separator className="mb-16" />

            {/* Проблема / Статистика */}
            <div className="mb-16">
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-6">
                    Чому це важливо саме зараз
                </h2>
                <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed text-[15px]">
                        Після початку повномасштабного вторгнення кількість покинутих тварин в Україні різко зросла.
                        Більшість із них — це колишні домашні улюбленці, яких господарі були змушені залишити під час евакуації.
                        Вони живі, здорові, звикли до людей — і чекають на нову родину.
                        За статистикою зоозахисників, навантаження на тих, хто рятує тварин, зросло катастрофічно:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5 text-center">
                            <div className="text-3xl font-black text-amber-600 mb-1">+20-30%</div>
                            <div className="text-sm font-medium text-gray-700">у тилових областях</div>
                        </div>
                        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5 text-center">
                            <div className="text-3xl font-black text-amber-600 mb-1">+60%</div>
                            <div className="text-sm font-medium text-gray-700">серед зооволонтерів</div>
                        </div>
                        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5 text-center">
                            <div className="text-3xl font-black text-amber-600 mb-1">+100%</div>
                            <div className="text-sm font-medium text-gray-700">у притулках прифронтових регіонів</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-16">
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-6">
                    Що ми вирішуємо
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {features.map((f) => (
                        <Card key={f.title} className="border shadow-none hover:shadow-sm transition-all duration-200">
                            <CardContent className="p-5 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <f.icon className="w-4 h-4 text-primary" />
                                    </div>
                                    <h3 className="font-bold text-base text-gray-900">{f.title}</h3>
                                </div>
                                <p className="text-[13px] text-muted-foreground leading-relaxed">
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
                    Для кого створена платформа
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="rounded-2xl bg-gray-50/50 border border-gray-100 p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-100 rounded-lg">
                                <Heart className="w-5 h-5 text-rose-500" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg">Шукаю тварину</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Переглядайте єдиний зручний каталог, фільтруйте тварин за своїми критеріями,
                            зберігайте вподобані оголошення та напряму спілкуйтесь з кураторами без посередників.
                        </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50/50 border border-gray-100 p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="w-5 h-5 text-blue-500" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg">Волонтер або притулок</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Публікуйте оголошення в інтуїтивному інтерфейсі, проходьте верифікацію для підвищення
                            довіри до вашого профілю та спілкуйтесь з потенційними власниками в одному безпечному місці.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-16">
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-8">
                    Як це працює
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
                    {steps.map((step, i) => (
                        <div key={step.number} className="flex sm:flex-col gap-4 sm:gap-4 relative group">
                            <div className="flex flex-col items-center sm:items-start shrink-0">
                                <span className="text-4xl font-black text-gray-100 group-hover:text-primary/20 transition-colors duration-300 leading-none">
                                    {step.number}
                                </span>
                                {i < steps.length - 1 && (
                                    <div className="hidden sm:block absolute top-4 -right-4 w-8 border-t-2 border-dashed border-gray-200"></div>
                                )}
                            </div>
                            <div className="space-y-1.5 pt-1 sm:pt-0">
                                <h3 className="font-bold text-gray-900 text-base">{step.title}</h3>
                                <p className="text-[13px] text-muted-foreground leading-relaxed">
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
                <div className="space-y-4 text-gray-700 leading-relaxed text-[15px] bg-white border rounded-2xl p-6 shadow-sm">
                    <p>
                        Ідея виникла з простого спостереження: людей, які хочуть взяти тварину додому, дуже багато — але знайти
                        "свого" улюбленця буває складно. Оголошення розкидані по різних групах у Facebook, Telegram-чатах та на OLX.
                        Немає єдиного зручного місця, де можна було б застосувати фільтри, зберегти історію та перевірити надійність автора.
                    </p>
                    <p>
                        KityPes — це спроба зібрати все в одному місці, зробити інтерфейс чистим, а процес адопції
                        простішим, прозорішим і безпечнішим для обох сторін.
                    </p>
                </div>
            </div>

            {/* CTA */}
            <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm mb-20">
                <div className="space-y-1.5 text-center sm:text-left">
                    <h3 className="font-extrabold text-gray-900 text-xl">
                        Готові знайти вірного друга?
                    </h3>
                    <p className="text-[15px] text-muted-foreground">
                        Перейдіть до каталогу та перегляньте актуальні оголошення.
                    </p>
                </div>
                <Button asChild size="lg" className="shrink-0 rounded-xl font-bold shadow-sm">
                    <Link href="/ads">
                        <SearchCheck className="w-5 h-5 mr-2" />
                        Переглянути каталог
                    </Link>
                </Button>
            </div>

        </div>
    )
}
