import { ThemeSwitcher } from "@/components/theme-switcher";
import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen flex flex-col">
            <nav className="w-full border-b">
                <div className="max-w-5xl mx-auto flex justify-between items-center p-4 px-6">
                    <Link href="/protected" className="text-xl font-semibold">
                        WindDown
                    </Link>
                    <div className="flex items-center gap-3">
                        <ThemeSwitcher />
                        <LogoutButton />
                    </div>
                </div>
            </nav>

            <div className="flex-1 max-w-5xl w-full mx-auto p-6">
                {children}
            </div>

            <footer className="w-full border-t py-4">
                <div className="max-w-5xl mx-auto px-6 text-center text-xs text-muted-foreground">
                    <p>&copy; 2025 WindDown</p>
                </div>
            </footer>
        </main>
    );
}
