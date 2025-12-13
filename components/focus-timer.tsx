"use client";

import { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Task } from "@/lib/types/database";

interface FocusTimerProps {
    task: Task;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function FocusTimer({ task, open, onOpenChange }: FocusTimerProps) {
    const [selectedDuration, setSelectedDuration] = useState(25);
    const [timeLeft, setTimeLeft] = useState(25 * 60); // in seconds
    const [isRunning, setIsRunning] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    const durations = [
        { label: "15 min", value: 15 },
        { label: "25 min", value: 25 },
        { label: "45 min", value: 45 },
        { label: "60 min", value: 60 },
    ];

    const breakDurations = [
        { label: "5 min", value: 5 },
        { label: "10 min", value: 10 },
        { label: "15 min", value: 15 },
    ];

    useEffect(() => {
        if (!open) {
            handleStop();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (!isRunning && intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRunning, timeLeft]);

    const handleStart = async () => {
        const supabase = createClient();
        
        // Create focus session
        const { data, error } = await supabase
            .from("focus_sessions")
            .insert({
                task_id: task.id,
                user_id: task.user_id,
                duration_minutes: selectedDuration,
                session_type: isBreak ? "break" : "focus",
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating focus session:", error);
            return;
        }

        setSessionId(data.id);
        setTimeLeft(selectedDuration * 60);
        setIsRunning(true);
    };

    const handlePause = () => {
        setIsRunning(false);
    };

    const handleResume = () => {
        setIsRunning(true);
    };

    const handleStop = async () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (sessionId) {
            const supabase = createClient();
            const completedMinutes = Math.floor(
                (selectedDuration * 60 - timeLeft) / 60
            );

            // Update focus session
            const { error: sessionError } = await supabase
                .from("focus_sessions")
                .update({
                    completed_minutes: completedMinutes,
                    completed_at: new Date().toISOString(),
                })
                .eq("id", sessionId);

            if (sessionError) {
                console.error("Error updating focus session:", sessionError);
            }

            // Update task total focus time
            if (!isBreak && completedMinutes > 0) {
                // First get the current value
                const { data: currentTask, error: fetchError } = await supabase
                    .from("tasks")
                    .select("total_focus_time_minutes")
                    .eq("id", task.id)
                    .single();

                if (fetchError) {
                    console.error("Error fetching current task time:", fetchError);
                }

                const currentTime = currentTask?.total_focus_time_minutes || 0;

                const { error: updateError } = await supabase
                    .from("tasks")
                    .update({
                        total_focus_time_minutes: currentTime + completedMinutes,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", task.id);

                if (updateError) {
                    console.error("Error updating task focus time:", updateError);
                } else {
                    console.log(`Updated task ${task.id} with ${completedMinutes} minutes (total: ${currentTime + completedMinutes})`);
                }
            }
        }

        setIsRunning(false);
        setTimeLeft(selectedDuration * 60);
        setSessionId(null);
        router.refresh();
    };

    const handleComplete = async () => {
        if (sessionId) {
            const supabase = createClient();

            // Update focus session
            const { error: sessionError } = await supabase
                .from("focus_sessions")
                .update({
                    completed: true,
                    completed_minutes: selectedDuration,
                    completed_at: new Date().toISOString(),
                })
                .eq("id", sessionId);

            if (sessionError) {
                console.error("Error updating focus session:", sessionError);
            }

            // Update task total focus time
            if (!isBreak) {
                // First get the current value
                const { data: currentTask, error: fetchError } = await supabase
                    .from("tasks")
                    .select("total_focus_time_minutes")
                    .eq("id", task.id)
                    .single();

                if (fetchError) {
                    console.error("Error fetching current task time:", fetchError);
                }

                const currentTime = currentTask?.total_focus_time_minutes || 0;

                const { error: updateError } = await supabase
                    .from("tasks")
                    .update({
                        total_focus_time_minutes: currentTime + selectedDuration,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", task.id);

                if (updateError) {
                    console.error("Error updating task focus time:", updateError);
                } else {
                    console.log(`Updated task ${task.id} with ${selectedDuration} minutes (total: ${currentTime + selectedDuration})`);
                }
            }
        }

        setIsRunning(false);
        
        // Show completion message
        if (!isBreak) {
            setIsBreak(true);
            setSelectedDuration(5);
            setTimeLeft(5 * 60);
            setSessionId(null);
        } else {
            // Break complete, close dialog
            setIsBreak(false);
            setSelectedDuration(25);
            setTimeLeft(25 * 60);
            setSessionId(null);
            onOpenChange(false);
        }
        
        router.refresh();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const progress = ((selectedDuration * 60 - timeLeft) / (selectedDuration * 60)) * 100;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isBreak ? "Take a Break" : "Focus Mode"}
                    </DialogTitle>
                    <DialogDescription>
                        {isBreak
                            ? "Great work! Time to rest and recharge."
                            : `Focus on: ${task.title}`}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {!isRunning && timeLeft === selectedDuration * 60 && (
                        <div className="space-y-3">
                            <label className="text-sm font-medium">
                                Select Duration
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {(isBreak ? breakDurations : durations).map((duration) => (
                                    <Button
                                        key={duration.value}
                                        variant={
                                            selectedDuration === duration.value
                                                ? "default"
                                                : "outline"
                                        }
                                        onClick={() => {
                                            setSelectedDuration(duration.value);
                                            setTimeLeft(duration.value * 60);
                                        }}
                                        className="w-full"
                                    >
                                        {duration.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    <Card>
                        <CardContent className="p-8">
                            <div className="flex flex-col items-center gap-4">
                                {/* Timer Display */}
                                <div className="relative w-48 h-48">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle
                                            cx="96"
                                            cy="96"
                                            r="88"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            className="text-muted"
                                            opacity="0.2"
                                        />
                                        <circle
                                            cx="96"
                                            cy="96"
                                            r="88"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            strokeDasharray={`${2 * Math.PI * 88}`}
                                            strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                                            className={isBreak ? "text-green-500" : "text-primary"}
                                            strokeLinecap="round"
                                            style={{
                                                transition: "stroke-dashoffset 1s linear",
                                            }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-4xl font-mono font-bold">
                                                {formatTime(timeLeft)}
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-1">
                                                {isRunning ? (isBreak ? "Break time" : "Stay focused") : "Ready to start"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Control Buttons */}
                                <div className="flex gap-2 w-full">
                                    {!isRunning && timeLeft === selectedDuration * 60 ? (
                                        <Button
                                            onClick={handleStart}
                                            className="flex-1"
                                            size="lg"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 mr-2"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            Start
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                onClick={isRunning ? handlePause : handleResume}
                                                className="flex-1"
                                                size="lg"
                                                variant={isRunning ? "outline" : "default"}
                                            >
                                                {isRunning ? (
                                                    <>
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-5 w-5 mr-2"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                        Pause
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-5 w-5 mr-2"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                        Resume
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                onClick={handleStop}
                                                variant="destructive"
                                                size="lg"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {task.total_focus_time_minutes > 0 && !isBreak && (
                        <div className="text-center text-sm text-muted-foreground">
                            Total focus time on this task:{" "}
                            <span className="font-semibold">
                                {Math.floor(task.total_focus_time_minutes / 60)}h{" "}
                                {task.total_focus_time_minutes % 60}m
                            </span>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
