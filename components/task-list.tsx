"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Task } from "@/lib/types/database";

interface TaskListProps {
    tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
    const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);
    const router = useRouter();

    const handleToggleComplete = async (task: Task) => {
        setLoadingTaskId(task.id);

        try {
            const supabase = createClient();
            const { error } = await supabase
                .from("tasks")
                .update({
                    completed: !task.completed,
                    completed_at: !task.completed ? new Date().toISOString() : null,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", task.id);

            if (error) throw error;
            router.refresh();
        } catch (error) {
            console.error("Error updating task:", error);
        } finally {
            setLoadingTaskId(null);
        }
    };

    const handleDelete = async (taskId: string) => {
        setLoadingTaskId(taskId);

        try {
            const supabase = createClient();
            const { error } = await supabase
                .from("tasks")
                .delete()
                .eq("id", taskId);

            if (error) throw error;
            router.refresh();
        } catch (error) {
            console.error("Error deleting task:", error);
        } finally {
            setLoadingTaskId(null);
        }
    };

    if (tasks.length === 0) {
        return (
            <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto mb-4 opacity-50"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                    </svg>
                    <p className="text-lg font-medium mb-1">No tasks yet</p>
                    <p className="text-sm">
                        Add your first task to start building your streak!
                    </p>
                </CardContent>
            </Card>
        );
    }

    const incompleteTasks = tasks.filter((task) => !task.completed);
    const completedTasks = tasks.filter((task) => task.completed);

    return (
        <div className="space-y-6">
            {/* Incomplete Tasks */}
            {incompleteTasks.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">
                        To Do ({incompleteTasks.length})
                    </h3>
                    <div className="space-y-2">
                        {incompleteTasks.map((task) => (
                            <Card key={task.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            checked={task.completed}
                                            onCheckedChange={() =>
                                                handleToggleComplete(task)
                                            }
                                            disabled={loadingTaskId === task.id}
                                            className="mt-1"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium">
                                                {task.title}
                                            </p>
                                            {task.description && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {task.description}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(task.id)}
                                            disabled={loadingTaskId === task.id}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">
                        Completed ({completedTasks.length})
                    </h3>
                    <div className="space-y-2">
                        {completedTasks.map((task) => (
                            <Card key={task.id} className="opacity-60">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            checked={task.completed}
                                            onCheckedChange={() =>
                                                handleToggleComplete(task)
                                            }
                                            disabled={loadingTaskId === task.id}
                                            className="mt-1"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium line-through">
                                                {task.title}
                                            </p>
                                            {task.description && (
                                                <p className="text-sm text-muted-foreground mt-1 line-through">
                                                    {task.description}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(task.id)}
                                            disabled={loadingTaskId === task.id}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
