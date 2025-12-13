"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/database";

interface PeerStreaksProps {
    userId: string;
    currentUserStreak: number;
}

interface PeerWithStreak extends Profile {
    connectionId: string;
}

export function PeerStreaks({ userId, currentUserStreak }: PeerStreaksProps) {
    const [peers, setPeers] = useState<PeerWithStreak[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPeerStreaks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const fetchPeerStreaks = async () => {
        const supabase = createClient();

        // Fetch connections where user is the sender
        const { data: sentConnections } = await supabase
            .from("connections")
            .select("id, connected_user_id, profile:profiles!connections_connected_user_id_fkey(*)")
            .eq("user_id", userId)
            .eq("status", "accepted");

        // Fetch connections where user is the receiver
        const { data: receivedConnections } = await supabase
            .from("connections")
            .select("id, user_id, profile:profiles!connections_user_id_fkey(*)")
            .eq("connected_user_id", userId)
            .eq("status", "accepted");

        const peersWithStreaks: PeerWithStreak[] = [];
        
        // Add sent connections
        if (sentConnections) {
            for (const conn of sentConnections) {
                if (conn.profile && !Array.isArray(conn.profile)) {
                    peersWithStreaks.push({
                        ...(conn.profile as unknown as Profile),
                        connectionId: conn.id,
                    });
                }
            }
        }

        // Add received connections
        if (receivedConnections) {
            for (const conn of receivedConnections) {
                if (conn.profile && !Array.isArray(conn.profile)) {
                    peersWithStreaks.push({
                        ...(conn.profile as unknown as Profile),
                        connectionId: conn.id,
                    });
                }
            }
        }

        setPeers(peersWithStreaks);
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Peer Streaks</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </CardContent>
            </Card>
        );
    }

    if (peers.length === 0) {
        return null;
    }

    // Sort by current streak descending
    const sortedPeers = [...peers].sort(
        (a, b) => (b.current_streak || 0) - (a.current_streak || 0)
    );

    // Add current user to the list for comparison
    const allUsers = [
        {
            id: userId,
            current_streak: currentUserStreak,
            full_name: "You",
            isCurrentUser: true,
        },
        ...sortedPeers.map((p) => ({
            id: p.id,
            current_streak: p.current_streak || 0,
            full_name: p.full_name || p.email?.split("@")[0] || "Unknown",
            isCurrentUser: false,
        })),
    ].sort((a, b) => b.current_streak - a.current_streak);

    const maxStreak = Math.max(...allUsers.map((u) => u.current_streak), 1);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
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
                    Streak Leaderboard
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {allUsers.map((user, index) => {
                        const percentage = (user.current_streak / maxStreak) * 100;
                        const isTopThree = index < 3 && user.current_streak > 0;

                        return (
                            <div
                                key={user.id}
                                className={`p-3 rounded-lg border ${
                                    user.isCurrentUser
                                        ? "bg-primary/10 border-primary"
                                        : "bg-card"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {isTopThree && (
                                            <span className="text-lg">
                                                {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                                            </span>
                                        )}
                                        <span
                                            className={`text-sm font-medium ${
                                                user.isCurrentUser
                                                    ? "text-primary font-semibold"
                                                    : ""
                                            }`}
                                        >
                                            {user.full_name}
                                        </span>
                                    </div>
                                    <Badge
                                        variant={user.isCurrentUser ? "default" : "secondary"}
                                        className="font-mono"
                                    >
                                        {user.current_streak} days
                                    </Badge>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${
                                            user.isCurrentUser
                                                ? "bg-primary"
                                                : "bg-orange-500"
                                        }`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {currentUserStreak === 0 && (
                    <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-dashed">
                        <p className="text-xs text-muted-foreground text-center">
                            💡 Complete a task today to start your streak!
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
