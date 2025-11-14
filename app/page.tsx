import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <main className="min-h-screen flex flex-col">
            {/* Navigation */}
            <nav className="w-full border-b border-b-foreground/10">
                <div className="max-w-6xl mx-auto flex justify-between items-center p-4 px-6">
                    <Link href="/" className="text-2xl font-bold tracking-tight">
                        WindDown
                    </Link>
                    <div className="flex items-center gap-4">
                        <ThemeSwitcher />
                        <Link href="/auth/login">
                            <Button variant="outline" size="sm">
                                Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="flex-1 flex items-center justify-center px-6">
                <div className="max-w-3xl text-center space-y-8">
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                        Manage your tasks.
                        <br />
                        <span className="text-muted-foreground">Wind down your day.</span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                        A simple, minimalistic task manager that helps you organize your work 
                        and end your day with clarity.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link href="/auth/sign-up">
                            <Button size="lg" className="w-full sm:w-auto">
                                Get Started
                            </Button>
                        </Link>
                        <Link href="/auth/login">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="w-full border-t py-6">
                <div className="max-w-6xl mx-auto px-6 text-center text-sm text-muted-foreground">
                    <p>&copy; 2025 WindDown. Simple task management.</p>
                </div>
            </footer>
        </main>
    );
}
