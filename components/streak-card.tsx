"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

interface StreakCardProps {
    currentStreak: number;
    longestStreak: number;
}

export function StreakCard({ currentStreak, longestStreak }: StreakCardProps) {
    const [timeUntilReset, setTimeUntilReset] = useState("");

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const diff = tomorrow.getTime() - now.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        };

        setTimeUntilReset(calculateTimeLeft());

        const interval = setInterval(() => {
            setTimeUntilReset(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <TooltipProvider>
            <div className="grid grid-cols-3 gap-3">
                {/* Current Streak */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Card className="cursor-help">
                            <CardContent className="p-4">
                                <div className="flex flex-col items-center text-center gap-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-orange-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <div className="text-2xl font-bold">{currentStreak}</div>
                                    <div className="text-xs text-muted-foreground">
                                        day streak
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Complete at least one task daily to maintain your streak</p>
                    </TooltipContent>
                </Tooltip>

                {/* Longest Streak */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Card className="cursor-help">
                            <CardContent className="p-4">
                                <div className="flex flex-col items-center text-center gap-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-yellow-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <div className="text-2xl font-bold">{longestStreak}</div>
                                    <div className="text-xs text-muted-foreground">
                                        best streak
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Your longest consecutive streak of completing tasks</p>
                    </TooltipContent>
                </Tooltip>

                {/* Countdown */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Card className="cursor-help">
                            <CardContent className="p-4">
                                <div className="flex flex-col items-center text-center gap-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-primary"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <div className="text-xl font-mono font-bold">
                            {timeUntilReset}
                        </div>
                                    <div className="text-xs text-muted-foreground">
                                        until reset
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Time remaining to complete a task today and keep your streak alive</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
}
