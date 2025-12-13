"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Task } from "@/lib/types/database";

interface TaskListProps {
    tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
    const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [deleteConfirmTask, setDeleteConfirmTask] = useState<Task | null>(null);
    const [undoTask, setUndoTask] = useState<Task | null>(null);
    const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null);
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
        if (undoTimeout) {
            clearTimeout(undoTimeout);
        }

        const taskToDelete = tasks.find((t) => t.id === taskId);
        if (!taskToDelete) return;

        setLoadingTaskId(taskId);
        setDeleteConfirmTask(null);

        try {
            const supabase = createClient();
            const { error } = await supabase
                .from("tasks")
                .delete()
                .eq("id", taskId);

            if (error) throw error;

            // Show undo notification
            setUndoTask(taskToDelete);
            const timeout = setTimeout(() => {
                setUndoTask(null);
            }, 5000);
            setUndoTimeout(timeout);

            router.refresh();
        } catch (error) {
            console.error("Error deleting task:", error);
        } finally {
            setLoadingTaskId(null);
        }
    };

    const handleUndo = async () => {
        if (!undoTask) return;

        if (undoTimeout) {
            clearTimeout(undoTimeout);
            setUndoTimeout(null);
        }

        try {
            const supabase = createClient();
            const { error } = await supabase.from("tasks").insert({
                id: undoTask.id,
                user_id: undoTask.user_id,
                title: undoTask.title,
                description: undoTask.description,
                completed: undoTask.completed,
                completed_at: undoTask.completed_at,
                due_date: undoTask.due_date,
                created_at: undoTask.created_at,
                updated_at: undoTask.updated_at,
            });

            if (error) throw error;

            setUndoTask(null);
            router.refresh();
        } catch (error) {
            console.error("Error restoring task:", error);
        }
    };

    const openEditDialog = (task: Task) => {
        setEditingTask(task);
        setEditTitle(task.title);
        setEditDescription(task.description || "");
    };

    const handleEditSave = async () => {
        if (!editingTask || !editTitle.trim()) return;

        setLoadingTaskId(editingTask.id);

        try {
            const supabase = createClient();
            const { error } = await supabase
                .from("tasks")
                .update({
                    title: editTitle.trim(),
                    description: editDescription.trim() || null,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", editingTask.id);

            if (error) throw error;

            setEditingTask(null);
            router.refresh();
        } catch (error) {
            console.error("Error updating task:", error);
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
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditDialog(task)}
                                                disabled={loadingTaskId === task.id}
                                                title="Edit task"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                </svg>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setDeleteConfirmTask(task)}
                                                disabled={loadingTaskId === task.id}
                                                title="Delete task"
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
                                            onClick={() => setDeleteConfirmTask(task)}
                                            disabled={loadingTaskId === task.id}
                                            title="Delete task"
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

            {/* Edit Task Dialog */}
            <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                        <DialogDescription>
                            Make changes to your task here.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="edit-title" className="text-sm font-medium">
                                Title
                            </label>
                            <Input
                                id="edit-title"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Task title"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="edit-description" className="text-sm font-medium">
                                Description
                            </label>
                            <Textarea
                                id="edit-description"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder="Task description (optional)"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditingTask(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditSave}
                            disabled={!editTitle.trim() || loadingTaskId === editingTask?.id}
                        >
                            {loadingTaskId === editingTask?.id ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteConfirmTask} onOpenChange={(open) => !open && setDeleteConfirmTask(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Task</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleteConfirmTask?.title}"? You can undo this action within 5 seconds.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirmTask(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteConfirmTask && handleDelete(deleteConfirmTask.id)}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Undo Delete Notification */}
            {undoTask && (
                <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
                    <Card className="shadow-lg">
                        <CardContent className="p-4 flex items-center gap-3">
                            <p className="text-sm">
                                Task "{undoTask.title}" deleted
                            </p>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleUndo}
                            >
                                Undo
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    if (undoTimeout) clearTimeout(undoTimeout);
                                    setUndoTask(null);
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
