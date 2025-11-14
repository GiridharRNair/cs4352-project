import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StreakCard } from "@/components/streak-card";
import { TaskList } from "@/components/task-list";
import { AddTaskForm } from "@/components/add-task-form";
import { PeerConnections } from "@/components/peer-connections";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function ProtectedPage() {
    const supabase = await createClient();

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        redirect("/auth/login");
    }

    // Fetch user profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    // Fetch tasks
    const { data: tasks } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <div className="flex-1 w-full flex flex-col gap-8">
            {/* Header with Streak */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-semibold mb-1">
                        Welcome back,{" "}
                        {profile?.full_name || user.email?.split("@")[0]}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Your PIN:{" "}
                        <span className="font-mono font-semibold">
                            {profile?.user_pin}
                        </span>
                    </p>
                </div>
                <StreakCard
                    currentStreak={profile?.current_streak || 0}
                    longestStreak={profile?.longest_streak || 0}
                />
            </div>

            {/* Main Content */}
            <Tabs defaultValue="tasks" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="tasks">My Tasks</TabsTrigger>
                    <TabsTrigger value="peers">Peers</TabsTrigger>
                </TabsList>

                <TabsContent value="tasks" className="space-y-6">
                    <AddTaskForm userId={user.id} />
                    <TaskList tasks={tasks || []} />
                </TabsContent>

                <TabsContent value="peers">
                    <PeerConnections userId={user.id} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
