import Footer from "@/components/shared/footer/footer";
import Header from "@/components/shared/header/header";
import { AuthGuard } from "@/provider/AuthGuard";

export default function UserLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">
                    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6">
                        {children}
                    </div>
                </main>
                <Footer />
            </div>
        </AuthGuard>
    );
}
