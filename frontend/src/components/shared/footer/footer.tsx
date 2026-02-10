import Link from "next/link"

const Footer = () => {
	return (
		<footer className="border-t bg-background">
			<div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0 px-4 md:px-6">
				<div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
					<p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
						© 2026 Kitypes
					</p>
				</div>
				<div className="flex gap-4 text-sm text-muted-foreground">
					<Link href={"#"} className="hover:underline">
						Більше про нас
					</Link>
					<Link href={"#"} className="hover:underline">
						Контакти
					</Link>
				</div>
			</div>
		</footer>
	)
}

export default Footer
