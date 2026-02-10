import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/shared/header/header"
import Footer from "@/components/shared/footer/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
	title: "Kitypes",
	description: "",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="uk">
			<body className={inter.className}>
				<div className="flex min-h-screen flex-col">
					<Header />
					<main className="flex-1">{children}</main>
					<Footer />
				</div>
			</body>
		</html>
	)
}
