"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { DailyReflectionWithProfile } from "@/lib/types/database";

interface PeerReflectionsProps {
    userId: string;
}

const MOOD_EMOJIS = {
    happy: "😊",
    neutral: "😐",
    sad: "😔",
} as const;

const MOOD_COLORS = {
    happy: "text-green-500",
    neutral: "text-yellow-500",
    sad: "text-blue-500",
} as const;

export function PeerReflections({ userId }: PeerReflectionsProps) {
    const [reflections, setReflections] = useState<DailyReflectionWithProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPeerReflections();
    }, [userId]);

    const fetchPeerReflections = async () => {
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

        if (peerIds.length === 0) {
            setReflections([]);
            setIsLoading(false);
            return;
        }

        // Fetch shared reflections from peers (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: reflectionsData } = await supabase
            .from("daily_reflections")
            .select("*, profile:profiles(*)")
            .in("user_id", peerIds)
            .eq("is_shared_with_peers", true)
            .gte("reflection_date", sevenDaysAgo.toISOString().split("T")[0])
            .order("reflection_date", { ascending: false });

        if (reflectionsData) {
            setReflections(reflectionsData as DailyReflectionWithProfile[]);
        }

        setIsLoading(false);
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            const days = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
            return `${days} days ago`;
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Peer Reflections</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </CardContent>
            </Card>
        );
    }

    if (reflections.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Peer Reflections</CardTitle>
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
                                d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
                            />
                        </svg>
                        <p className="text-sm text-muted-foreground">
                            No shared reflections yet
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            When your peers share their daily reflections, they&apos;ll appear here
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Peer Reflections</CardTitle>
                <p className="text-sm text-muted-foreground">
                    See how your connected peers are winding down
                </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {reflections.map((reflection) => (
                        <div
                            key={reflection.id}
                            className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className={`text-3xl ${MOOD_COLORS[reflection.mood]}`}>
                                        {MOOD_EMOJIS[reflection.mood]}
                                    </span>
                                    <div>
                                        <p className="font-semibold">
                                            {reflection.profile.full_name || reflection.profile.email?.split("@")[0]}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {getTimeAgo(reflection.reflection_date)}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant="secondary">
                                    {reflection.tasks_completed_count} {reflection.tasks_completed_count === 1 ? "task" : "tasks"} completed
                                </Badge>
                            </div>

                            {reflection.gratitude_note && (
                                <div className="mb-2 p-3 rounded bg-muted/50">
                                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                                        Grateful for:
                                    </p>
                                    <p className="text-sm">{reflection.gratitude_note}</p>
                                </div>
                            )}

                            {reflection.reflection_note && (
                                <div className="p-3 rounded bg-muted/50">
                                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                                        Reflection:
                                    </p>
                                    <p className="text-sm">{reflection.reflection_note}</p>
                                </div>
                            )}

                            {!reflection.gratitude_note && !reflection.reflection_note && (
                                <p className="text-sm text-muted-foreground italic">
                                    Shared their mood only
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
