"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { DailyReflection, Task } from "@/lib/types/database";

interface DailyReflectionFormProps {
    userId: string;
}

const MOODS = [
    { value: "happy", emoji: "😊", label: "Happy" },
    { value: "neutral", emoji: "😐", label: "Neutral" },
    { value: "sad", emoji: "😔", label: "Sad" },
] as const;

export function DailyReflectionForm({ userId }: DailyReflectionFormProps) {
    const router = useRouter();
    const [selectedMood, setSelectedMood] = useState<"happy" | "neutral" | "sad" | null>(null);
    const [gratitudeNote, setGratitudeNote] = useState("");
    const [reflectionNote, setReflectionNote] = useState("");
    const [isShared, setIsShared] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [todaysTasks, setTodaysTasks] = useState<Task[]>([]);
    const [existingReflection, setExistingReflection] = useState<DailyReflection | null>(null);
    const [successMessage, setSuccessMessage] = useState(false);

    useEffect(() => {
        fetchTodayData();
    }, [userId]);

    const fetchTodayData = async () => {
        setIsLoading(true);
        const supabase = createClient();
        const today = new Date().toISOString().split("T")[0];

        // Fetch today's completed tasks
        const { data: tasks } = await supabase
            .from("tasks")
            .select("*")
            .eq("user_id", userId)
            .eq("completed", true)
            .gte("completed_at", `${today}T00:00:00`)
            .lte("completed_at", `${today}T23:59:59`)
            .order("completed_at", { ascending: false });

        if (tasks) {
            setTodaysTasks(tasks);
        }

        // Check if reflection already exists for today
        const { data: reflection } = await supabase
            .from("daily_reflections")
            .select("*")
            .eq("user_id", userId)
            .eq("reflection_date", today)
            .maybeSingle();

        if (reflection) {
            setExistingReflection(reflection);
            setSelectedMood(reflection.mood);
            setGratitudeNote(reflection.gratitude_note || "");
            setReflectionNote(reflection.reflection_note || "");
            setIsShared(reflection.is_shared_with_peers);
        }

        setIsLoading(false);
    };

    const handleSave = async () => {
        if (!selectedMood) {
            return;
        }

        setIsSaving(true);
        const supabase = createClient();
        const today = new Date().toISOString().split("T")[0];

        const reflectionData = {
            user_id: userId,
            reflection_date: today,
            mood: selectedMood,
            gratitude_note: gratitudeNote.trim() || null,
            reflection_note: reflectionNote.trim() || null,
            tasks_completed_count: todaysTasks.length,
            is_shared_with_peers: isShared,
            updated_at: new Date().toISOString(),
        };

        if (existingReflection) {
            // Update existing reflection
            await supabase
                .from("daily_reflections")
                .update(reflectionData)
                .eq("id", existingReflection.id);
        } else {
            // Create new reflection
            await supabase.from("daily_reflections").insert(reflectionData);
        }

        setSuccessMessage(true);
        setTimeout(() => setSuccessMessage(false), 2000);
        setIsSaving(false);
        router.refresh();
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Daily Wind Down</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-purple-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                    Daily Wind Down
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Reflect on your day and transition to rest mode
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Today's Summary */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Today&apos;s Accomplishments</h3>
                    {todaysTasks.length > 0 ? (
                        <div className="space-y-2">
                            <Badge variant="secondary" className="mb-2">
                                ✓ {todaysTasks.length} {todaysTasks.length === 1 ? "task" : "tasks"} completed
                            </Badge>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                                {todaysTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="text-sm flex items-start gap-2 p-2 rounded bg-muted/50"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span className="flex-1">{task.title}</span>
                                        {task.total_focus_time_minutes > 0 && (
                                            <Badge variant="outline" className="text-xs">
                                                {task.total_focus_time_minutes}m focused
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No tasks completed today. Tomorrow is a new opportunity!
                        </p>
                    )}
                </div>

                {/* Mood Check-in */}
                <div className="space-y-2">
                    <Label className="font-semibold text-sm">How are you feeling?</Label>
                    <div className="flex gap-3">
                        {MOODS.map((mood) => (
                            <Button
                                key={mood.value}
                                variant={selectedMood === mood.value ? "default" : "outline"}
                                size="lg"
                                className="flex-1 flex flex-col items-center gap-2 h-auto py-4"
                                onClick={() => setSelectedMood(mood.value)}
                            >
                                <span className="text-3xl">{mood.emoji}</span>
                                <span className="text-xs">{mood.label}</span>
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Gratitude Note */}
                <div className="space-y-2">
                    <Label htmlFor="gratitude" className="font-semibold text-sm">
                        What are you grateful for? (Optional)
                    </Label>
                    <Textarea
                        id="gratitude"
                        placeholder="Today I'm grateful for..."
                        value={gratitudeNote}
                        onChange={(e) => setGratitudeNote(e.target.value)}
                        rows={3}
                        className="resize-none"
                    />
                </div>

                {/* Reflection Note */}
                <div className="space-y-2">
                    <Label htmlFor="reflection" className="font-semibold text-sm">
                        Any reflections on your day? (Optional)
                    </Label>
                    <Textarea
                        id="reflection"
                        placeholder="Today I learned... / Tomorrow I will..."
                        value={reflectionNote}
                        onChange={(e) => setReflectionNote(e.target.value)}
                        rows={3}
                        className="resize-none"
                    />
                </div>

                {/* Share with Peers */}
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="share"
                        checked={isShared}
                        onCheckedChange={(checked) => setIsShared(checked as boolean)}
                    />
                    <Label
                        htmlFor="share"
                        className="text-sm font-normal cursor-pointer"
                    >
                        Share my mood and reflections with connected peers
                    </Label>
                </div>

                {/* Save Button */}
                <Button
                    onClick={handleSave}
                    disabled={!selectedMood || isSaving}
                    className="w-full"
                    size="lg"
                >
                    {isSaving ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </>
                    ) : successMessage ? (
                        <>
                            <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Saved!
                        </>
                    ) : existingReflection ? "Update Reflection" : "Save Reflection"}
                </Button>

                {existingReflection && (
                    <p className="text-xs text-center text-muted-foreground">
                        You can update your reflection until midnight
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
