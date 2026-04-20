import Link from "next/link"

const Footer = () => {
    return (
        <footer className="border-t bg-background">
            <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
                <div className="flex min-h-20 flex-col items-center justify-between gap-3 py-5 md:min-h-24 md:flex-row md:py-0">
                    <p className="text-sm text-muted-foreground text-center md:text-left">
                        © 2026 Kitypes
                    </p>

                    <div className="flex items-center gap-5 text-sm text-muted-foreground">
                        <Link href="#" className="hover:text-foreground transition-colors">
                            Більше про нас
                        </Link>
                        <Link href="#" className="hover:text-foreground transition-colors">
                            Контакти
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
