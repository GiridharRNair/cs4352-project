"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { ActivityFeedWithProfile, PeerReaction } from "@/lib/types/database";

interface PeerActivityFeedProps {
    userId: string;
}

const REACTIONS = ["🔥", "👏", "💪", "🎉", "❤️"];

export function PeerActivityFeed({ userId }: PeerActivityFeedProps) {
    const [activities, setActivities] = useState<ActivityFeedWithProfile[]>([]);
    const [reactions, setReactions] = useState<Record<string, PeerReaction[]>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchActivities();
        
        // Set up real-time subscription for activity feed
        const supabase = createClient();
        const channel = supabase
            .channel("activity_feed_changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "activity_feed",
                },
                () => {
                    fetchActivities();
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "peer_reactions",
                },
                () => {
                    fetchActivities();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const fetchActivities = async () => {
        const supabase = createClient();

        // Get connections in both directions
        const { data: sentConnections } = await supabase
            .from("connections")
            .select("connected_user_id")
            .eq("user_id", userId)
            .eq("status", "accepted");

        const { data: receivedConnections } = await supabase
            .from("connections")
            .select("user_id")
            .eq("connected_user_id", userId)
            .eq("status", "accepted");

        const peerIds = [
            ...(sentConnections?.map((c) => c.connected_user_id) || []),
            ...(receivedConnections?.map((c) => c.user_id) || []),
        ];

        console.log("Peer IDs:", peerIds);

        if (peerIds.length === 0) {
            console.log("No connected peers found");
            setActivities([]);
            setIsLoading(false);
            return;
        }

        // Fetch activities from peers
        const { data: activitiesData, error } = await supabase
            .from("activity_feed")
            .select("*, profile:profiles(*)")
            .in("user_id", peerIds)
            .order("created_at", { ascending: false })
            .limit(20);

        console.log("Activities data:", activitiesData);
        console.log("Activities error:", error);

        if (activitiesData) {
            setActivities(activitiesData as ActivityFeedWithProfile[]);

            // Fetch reactions for these activities
            const activityIds = activitiesData
                .filter((a) => a.task_id)
                .map((a) => a.task_id!);

            if (activityIds.length > 0) {
                const { data: reactionsData } = await supabase
                    .from("peer_reactions")
                    .select("*")
                    .in("task_id", activityIds);

                if (reactionsData) {
                    const reactionsByTask: Record<string, PeerReaction[]> = {};
                    reactionsData.forEach((reaction) => {
                        if (reaction.task_id) {
                            if (!reactionsByTask[reaction.task_id]) {
                                reactionsByTask[reaction.task_id] = [];
                            }
                            reactionsByTask[reaction.task_id].push(reaction);
                        }
                    });
                    setReactions(reactionsByTask);
                }
            }
        }

        setIsLoading(false);
    };

    const handleReaction = async (
        activityUserId: string,
        taskId: string | null,
        emoji: string
    ) => {
        if (!taskId) return;

        const supabase = createClient();

        // Check if user already reacted with this emoji
        const existingReaction = reactions[taskId]?.find(
            (r) => r.from_user_id === userId && r.reaction_type === emoji
        );

        if (existingReaction) {
            // Remove reaction
            await supabase
                .from("peer_reactions")
                .delete()
                .eq("id", existingReaction.id);
        } else {
            // Add reaction
            await supabase.from("peer_reactions").insert({
                from_user_id: userId,
                to_user_id: activityUserId,
                task_id: taskId,
                reaction_type: emoji,
            });
        }

        fetchActivities();
    };

    const getActivityIcon = (activityType: string) => {
        switch (activityType) {
            case "task_completed":
                return (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-green-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                        />
                    </svg>
                );
            case "streak_milestone":
                return (
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
                );
            default:
                return (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-primary"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path
                            fillRule="evenodd"
                            d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                            clipRule="evenodd"
                        />
                    </svg>
                );
        }
    };

    const getActivityMessage = (activity: ActivityFeedWithProfile) => {
        const name = activity.profile.full_name || activity.profile.email?.split("@")[0] || "A peer";
        const metadata = activity.metadata as { task_title?: string; streak_count?: number } | null;

        switch (activity.activity_type) {
            case "task_completed":
                return (
                    <>
                        <span className="font-semibold">{name}</span> completed{" "}
                        <span className="font-medium">{metadata?.task_title}</span>
                    </>
                );
            case "streak_milestone":
                return (
                    <>
                        <span className="font-semibold">{name}</span> reached a{" "}
                        <span className="font-medium">{metadata?.streak_count}-day streak!</span>
                    </>
                );
            case "task_created":
                return (
                    <>
                        <span className="font-semibold">{name}</span> created a new task
                    </>
                );
            default:
                return null;
        }
    };

    const getTimeAgo = (timestamp: string) => {
        const now = new Date();
        const then = new Date(timestamp);
        const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

        if (seconds < 60) return "just now";
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Activity Feed</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </CardContent>
            </Card>
        );
    }

    if (activities.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Activity Feed</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                        <p className="text-sm text-muted-foreground">
                            No activity yet from your peers
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Connect with friends to see their progress!
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Activity Feed</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.map((activity) => {
                        const taskReactions = activity.task_id
                            ? reactions[activity.task_id] || []
                            : [];
                        const userReaction = taskReactions.find(
                            (r) => r.from_user_id === userId
                        );

                        return (
                            <div 
                                key={activity.id}
                                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                            >
                                <div className="mt-0.5">{getActivityIcon(activity.activity_type)}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm">
                                        {getActivityMessage(activity)}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs text-muted-foreground">
                                            {getTimeAgo(activity.created_at)}
                                        </span>
                                    </div>
                                    {activity.task_id && (
                                        <div className="flex items-center gap-1 mt-2 flex-wrap">
                                            <span className="text-xs text-muted-foreground mr-1">React:</span>
                                            {REACTIONS.map((emoji) => {
                                                const count = taskReactions.filter(
                                                    (r) => r.reaction_type === emoji
                                                ).length;
                                                const isActive =
                                                    userReaction?.reaction_type === emoji;

                                                return (
                                                    <Button
                                                        key={emoji}
                                                        variant={isActive ? "default" : "outline"}
                                                        size="sm"
                                                        className="h-7 px-2 text-base"
                                                        onClick={() =>
                                                            handleReaction(
                                                                activity.user_id,
                                                                activity.task_id,
                                                                emoji
                                                            )
                                                        }
                                                    >
                                                        {emoji}
                                                        {count > 0 && (
                                                            <span className="ml-1 text-xs font-semibold">
                                                                {count}
                                                            </span>
                                                        )}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
