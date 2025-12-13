import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StreakCard } from "@/components/streak-card";
import { TaskList } from "@/components/task-list";
import { AddTaskForm } from "@/components/add-task-form";
import { PeerConnections } from "@/components/peer-connections";
import { PeerActivityFeed } from "@/components/peer-activity-feed";
import { PeerStreaks } from "@/components/peer-streaks";
import { DailyReflectionForm } from "@/components/daily-reflection-form";
import { PeerReflections } from "@/components/peer-reflections";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                            Your Peer PIN:
                        </p>
                        <Badge variant="secondary" className="font-mono text-base px-3">
                            {profile?.user_pin}
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Share this PIN with others to connect and view each other&apos;s progress
                    </p>
                </div>
                <StreakCard
                    currentStreak={profile?.current_streak || 0}
                    longestStreak={profile?.longest_streak || 0}
                />
            </div>

            {/* Main Content */}
            <Tabs defaultValue="tasks" className="w-full">
                <TabsList className="grid w-full max-w-2xl grid-cols-3">
                    <TabsTrigger value="tasks">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                        My Tasks
                    </TabsTrigger>
                    <TabsTrigger value="peers">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                        Peers
                    </TabsTrigger>
                    <TabsTrigger value="reflect">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                        Wind Down
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="tasks" className="space-y-6">
                    <AddTaskForm userId={user.id} />
                    <TaskList tasks={tasks || []} />
                </TabsContent>

                <TabsContent value="peers" className="space-y-6">
                    <PeerStreaks 
                        userId={user.id} 
                        currentUserStreak={profile?.current_streak || 0}
                    />
                    <PeerActivityFeed userId={user.id} />
                    <PeerConnections userId={user.id} />
                </TabsContent>

                <TabsContent value="reflect" className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <DailyReflectionForm userId={user.id} />
                        <PeerReflections userId={user.id} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
