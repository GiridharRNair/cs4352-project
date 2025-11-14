import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
    return (
        <main className="min-h-screen flex flex-col">
            {/* Navigation */}
            <nav className="w-full border-b">
                <div className="max-w-6xl mx-auto flex justify-between items-center p-4 px-6">
                    <Link href="/" className="text-xl font-semibold">
                        WindDown
                    </Link>
                    <div className="flex items-center gap-4">
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
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="max-w-4xl w-full space-y-12">
                    {/* Main Hero */}
                    <div className="text-center space-y-6">
                        <Badge
                            variant="secondary"
                            className="text-sm px-4 py-1"
                        >
                            Reduce screen time, increase productivity
                        </Badge>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                            Time to
                            <br />
                            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                Wind Down
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Break free from endless scrolling. Organize your
                            tasks, set meaningful goals, and reclaim your time
                            with intentional daily planning.
                        </p>

                        <div className="pt-4">
                            <Link href="/auth/login">
                                <Button size="lg" className="text-base px-8">
                                    Start Your Journey
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Features */}
                    <div
                        id="features"
                        className="grid md:grid-cols-3 gap-8 pt-12"
                    >
                        <div className="space-y-3 text-center md:text-left">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto md:mx-0">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                    />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-lg">
                                Task Management
                            </h3>
                            <p className="text-muted-foreground text-sm">
                                Organize your day with simple, focused task
                                lists that help you prioritize what matters.
                            </p>
                        </div>

                        <div className="space-y-3 text-center md:text-left">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto md:mx-0">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-lg">
                                Screen Time Awareness
                            </h3>
                            <p className="text-muted-foreground text-sm">
                                Track your progress and build healthier digital
                                habits with mindful transitions.
                            </p>
                        </div>

                        <div className="space-y-3 text-center md:text-left">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto md:mx-0">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-lg">
                                Daily Reflection
                            </h3>
                            <p className="text-muted-foreground text-sm">
                                End each day with clarity. Review
                                accomplishments and plan for tomorrow.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="w-full border-t py-6">
                <div className="max-w-6xl mx-auto px-6 text-center text-sm text-muted-foreground">
                    <p>&copy; 2025 WindDown. Built for intentional living.</p>
                </div>
            </footer>
        </main>
    );
}
