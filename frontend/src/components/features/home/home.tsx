import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, Search, ShieldCheck, PawPrint } from "lucide-react"

const Home = () => {
	return (
		<div className="flex flex-col min-h-screen w-10/12 justify-center mx-auto">
			<section className="w-full py-20 md:py-32 bg-linear-to-b from-background to-muted/50">
				<div className="container px-4 md:px-6 mx-auto text-center">
					<div className="flex flex-col items-center space-y-4">
						<div className="p-3 bg-primary/10 rounded-full mb-4">
							<PawPrint className="h-10 w-10 text-primary" />
						</div>
						<h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
							Знайди дім для пухнастого друга
						</h1>
						<p className="mx-auto max-w-175 text-muted-foreground md:text-xl">
							Kitypes — це платформа, що допомагає тваринам знайти
							нових люблячих власників. Безпечно, швидко та з
							турботою про кожного хвостика.
						</p>
						<div className="space-x-4 pt-4">
							<Button asChild size="lg" className="px-8">
								<Link href="/ads">Знайти друга</Link>
							</Button>
							<Button
								asChild
								variant="outline"
								size="lg"
								className="px-8"
							>
								<Link href="/create">Віддати в добрі руки</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

			<section className="w-full py-12 md:py-24 lg:py-32 bg-background">
				<div className="container px-4 md:px-6 mx-auto">
					<div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
						<div className="flex flex-col items-center space-y-4 text-center p-6 border rounded-xl hover:shadow-lg transition-shadow bg-card">
							<div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900/20">
								<Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
							</div>
							<h3 className="text-xl font-bold">
								Розумний пошук
							</h3>
							<p className="text-muted-foreground">
								Зручні фільтри допоможуть знайти тварину за
								породою, віком та містом.
							</p>
						</div>

						<div className="flex flex-col items-center space-y-4 text-center p-6 border rounded-xl hover:shadow-lg transition-shadow bg-card">
							<div className="p-3 bg-red-100 rounded-full dark:bg-red-900/20">
								<Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
							</div>
							<h3 className="text-xl font-bold">З турботою</h3>
							<p className="text-muted-foreground">
								Ми допомагаємо перевірити майбутніх власників та
								забезпечуємо підтримку.
							</p>
						</div>

						<div className="flex flex-col items-center space-y-4 text-center p-6 border rounded-xl hover:shadow-lg transition-shadow bg-card">
							<div className="p-3 bg-green-100 rounded-full dark:bg-green-900/20">
								<ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
							</div>
							<h3 className="text-xl font-bold">Безпека даних</h3>
							<p className="text-muted-foreground">
								Всі оголошення проходять модерацію, щоб уникнути
								шахрайства.
							</p>
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}

export default Home
