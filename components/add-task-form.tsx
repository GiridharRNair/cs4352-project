"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AddTaskFormProps {
    userId: string;
}

export function AddTaskForm({ userId }: AddTaskFormProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsLoading(true);

        try {
            const supabase = createClient();
            const { error } = await supabase.from("tasks").insert({
                user_id: userId,
                title: title.trim(),
                description: description.trim() || null,
                due_date: new Date().toISOString().split("T")[0], // Today's date
            });

            if (error) throw error;

            setTitle("");
            setDescription("");
            router.refresh();
        } catch (error) {
            console.log("Error creating task:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            placeholder="What do you need to do?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isLoading}
                            className="text-base"
                        />
                        <Input
                            placeholder="Add a description (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading || !title.trim()}
                        className="w-full"
                    >
                        {isLoading ? "Adding..." : "Add Task"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
