import Link from "next/link"
import { PawPrint, Search, Heart, MessageCircle, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const Home = () => {
    return (
        <div className="flex flex-col flex-1 min-h-[calc(100vh-4rem)] bg-white">

            <section className="w-full pt-16 pb-12 md:pt-24 md:pb-16 bg-gradient-to-b from-gray-50/80 to-white">
                <div className="container px-4 md:px-6 mx-auto text-center max-w-4xl">
                    <div className="flex flex-col items-center space-y-6">

                        <div className="p-4 bg-primary/5 text-primary rounded-3xl mb-2">
                            <PawPrint className="h-10 w-10" />
                        </div>

                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-gray-900">
                            Знайди дім для пухнастого друга
                        </h1>

                        <p className="mx-auto max-w-[650px] text-muted-foreground text-lg md:text-xl leading-relaxed">
                            Kitypes — це затишна платформа, що допомагає тваринам знайти нових люблячих власників. Безпечно, швидко та з турботою про кожного хвостика.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-6 w-full sm:w-auto justify-center">
                            <Button asChild size="lg" className="h-14 px-8 text-base rounded-full shadow-md hover:shadow-lg transition-all">
                                <Link href="/ads" className="flex items-center justify-center gap-2">
                                    Знайти друга <ArrowRight className="h-5 w-5" />
                                </Link>
                            </Button>

                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="h-14 px-8 text-base rounded-full border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all bg-white shadow-sm"
                            >
                                <Link href="/ads/create">Віддати в добрі руки</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="w-full pt-10 pb-24 md:pt-16 md:pb-32">
                <div className="container px-4 md:px-6 mx-auto max-w-5xl">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                        <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-3xl bg-gray-50/50">
                            <CardHeader className="text-center pb-2 pt-8">
                                <div className="mx-auto p-4 bg-blue-100/50 rounded-2xl mb-4">
                                    <Search className="h-7 w-7 text-blue-600" />
                                </div>
                                <CardTitle className="text-lg font-bold text-gray-800">Розумний пошук</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center text-gray-500 pb-8 text-sm md:text-base">
                                Зручні фільтри допоможуть швидко знайти тваринку за породою, віком та вашим містом.
                            </CardContent>
                        </Card>

                        <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-3xl bg-gray-50/50">
                            <CardHeader className="text-center pb-2 pt-8">
                                <div className="mx-auto p-4 bg-red-100/50 rounded-2xl mb-4">
                                    <Heart className="h-7 w-7 text-red-500" />
                                </div>
                                <CardTitle className="text-lg font-bold text-gray-800">З турботою</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center text-gray-500 pb-8 text-sm md:text-base">
                                Сотні хвостиків чекають на свою родину. Подаруйте їм любов, на яку вони заслуговують.
                            </CardContent>
                        </Card>

                        <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-3xl bg-gray-50/50">
                            <CardHeader className="text-center pb-2 pt-8">
                                <div className="mx-auto p-4 bg-green-100/50 rounded-2xl mb-4">
                                    <MessageCircle className="h-7 w-7 text-green-600" />
                                </div>
                                <CardTitle className="text-lg font-bold text-gray-800">Прямий зв'язок</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center text-gray-500 pb-8 text-sm md:text-base">
                                Спілкуйтеся з майбутніми або поточними власниками напряму через зручний вбудований чат.
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home
