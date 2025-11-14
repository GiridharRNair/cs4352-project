import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <main className="min-h-screen flex flex-col">
            {/* Navigation */}
            <nav className="w-full border-b">
                <div className="max-w-5xl mx-auto flex justify-between items-center p-4 px-6">
                    <Link href="/" className="text-xl font-semibold">
                        WindDown
                    </Link>
                    <div className="flex items-center gap-3">
                        <ThemeSwitcher />
                        <Link href="/auth/login">
                            <Button variant="ghost" size="sm">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="flex-1 flex items-center justify-center px-6">
                <div className="max-w-2xl text-center space-y-6">
                    <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                        Simple task management
                    </h1>
                    
                    <p className="text-base md:text-lg text-muted-foreground">
                        Organize your tasks. Wind down your day.
                    </p>

                    <div className="pt-2">
                        <Link href="/auth/login">
                            <Button size="lg">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="w-full border-t py-4">
                <div className="max-w-5xl mx-auto px-6 text-center text-xs text-muted-foreground">
                    <p>&copy; 2025 WindDown</p>
                </div>
            </footer>
        </main>
    );
}
