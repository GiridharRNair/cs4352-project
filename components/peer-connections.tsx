"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Profile, Task } from "@/lib/types/database";

interface PeerConnectionsProps {
    userId: string;
}

interface ConnectionWithDetails {
    id: string;
    user_id: string;
    connected_user_id: string;
    status: "pending" | "accepted" | "rejected";
    profile: Profile;
    tasks?: Task[];
}

export function PeerConnections({ userId }: PeerConnectionsProps) {
    const [pin, setPin] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [connections, setConnections] = useState<ConnectionWithDetails[]>([]);
    const [pendingRequests, setPendingRequests] = useState<
        ConnectionWithDetails[]
    >([]);
    const router = useRouter();

    useEffect(() => {
        fetchConnections();
        fetchPendingRequests();
    }, [userId]);

    const fetchConnections = async () => {
        const supabase = createClient();

        // Get accepted connections
        const { data: connectionsData } = await supabase
            .from("connections")
            .select("*, profile:profiles!connections_connected_user_id_fkey(*)")
            .eq("user_id", userId)
            .eq("status", "accepted");

        if (connectionsData) {
            // Fetch tasks for each connected user
            const connectionsWithTasks = await Promise.all(
                connectionsData.map(async (conn: any) => {
                    const { data: tasks } = await supabase
                        .from("tasks")
                        .select("*")
                        .eq("user_id", conn.connected_user_id)
                        .order("created_at", { ascending: false });

                    return {
                        ...conn,
                        tasks: tasks || [],
                    };
                }),
            );

            setConnections(connectionsWithTasks);
        }
    };

    const fetchPendingRequests = async () => {
        const supabase = createClient();

        // Get pending requests where user is the recipient
        const { data } = await supabase
            .from("connections")
            .select("*, profile:profiles!connections_user_id_fkey(*)")
            .eq("connected_user_id", userId)
            .eq("status", "pending");

        if (data) {
            setPendingRequests(data as any);
        }
    };

    const handleConnectByPin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pin.trim() || pin.length !== 6) {
            setError("Please enter a valid 6-digit PIN");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const supabase = createClient();

            // Find user by PIN
            const { data: targetUser, error: findError } = await supabase
                .from("profiles")
                .select("id, email, full_name")
                .eq("user_pin", pin)
                .maybeSingle();

            if (findError) {
                console.error("Error finding user:", findError);
                setError("Error searching for user. Please try again.");
                setIsLoading(false);
                return;
            }

            if (!targetUser) {
                setError("User not found with this PIN. Please check the PIN and try again.");
                setIsLoading(false);
                return;
            }

            if (targetUser.id === userId) {
                setError("You cannot connect with yourself");
                setIsLoading(false);
                return;
            }

            // Check if connection already exists
            const { data: existing } = await supabase
                .from("connections")
                .select("id, status")
                .or(
                    `and(user_id.eq.${userId},connected_user_id.eq.${targetUser.id}),and(user_id.eq.${targetUser.id},connected_user_id.eq.${userId})`,
                );

            if (existing && existing.length > 0) {
                const existingConnection = existing[0];
                if (existingConnection.status === "pending") {
                    setError("Connection request already pending");
                } else if (existingConnection.status === "accepted") {
                    setError("You are already connected with this user");
                } else {
                    setError("Connection already exists");
                }
                setIsLoading(false);
                return;
            }

            // Create connection request
            const { error: insertError } = await supabase
                .from("connections")
                .insert({
                    user_id: userId,
                    connected_user_id: targetUser.id,
                    status: "pending",
                });

            if (insertError) {
                console.error("Error creating connection:", insertError);
                throw insertError;
            }

            setPin("");
            alert(`Connection request sent to ${targetUser.full_name || targetUser.email}!`);
            router.refresh();
        } catch (error) {
            console.error("Error connecting:", error);
            setError("Failed to send connection request. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcceptRequest = async (connectionId: string) => {
        setIsLoading(true);

        try {
            const supabase = createClient();
            const { error } = await supabase
                .from("connections")
                .update({ status: "accepted" })
                .eq("id", connectionId);

            if (error) throw error;

            await fetchConnections();
            await fetchPendingRequests();
            router.refresh();
        } catch (error) {
            console.error("Error accepting request:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRejectRequest = async (connectionId: string) => {
        setIsLoading(true);

        try {
            const supabase = createClient();
            const { error } = await supabase
                .from("connections")
                .delete()
                .eq("id", connectionId);

            if (error) throw error;

            await fetchPendingRequests();
            router.refresh();
        } catch (error) {
            console.error("Error rejecting request:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Info Banner */}
            <Card className="bg-muted/50 border-primary/20">
                <CardContent className="p-4">
                    <div className="flex gap-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <div className="text-sm">
                            <p className="font-medium mb-1">About Peer Connections</p>
                            <p className="text-muted-foreground">
                                Connect with friends using their 6-digit PIN to view each other's task completion progress and streaks. Stay motivated together!
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Connect by PIN */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Connect with Peers</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleConnectByPin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">
                                Enter a friend&apos;s 6-digit PIN to connect
                            </label>
                            <Input
                                placeholder="123456"
                                value={pin}
                                onChange={(e) =>
                                    setPin(e.target.value.replace(/\D/g, ""))
                                }
                                maxLength={6}
                                disabled={isLoading}
                                className="text-center text-lg font-mono tracking-wider"
                            />
                        </div>
                        {error && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}
                        <Button
                            type="submit"
                            disabled={isLoading || pin.length !== 6}
                            className="w-full"
                        >
                            {isLoading ? "Connecting..." : "Send Request"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Pending Requests ({pendingRequests.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {pendingRequests.map((request) => (
                            <div
                                key={request.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                            >
                                <div>
                                    <p className="font-medium">
                                        {request.profile.full_name ||
                                            request.profile.email}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        PIN: {request.profile.user_pin}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleAcceptRequest(request.id)
                                        }
                                        disabled={isLoading}
                                    >
                                        Accept
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            handleRejectRequest(request.id)
                                        }
                                        disabled={isLoading}
                                    >
                                        Decline
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Connected Peers */}
            {connections.length > 0 ? (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                        Your Peers ({connections.length})
                    </h3>
                    {connections.map((connection) => {
                        const completedToday =
                            connection.tasks?.filter(
                                (task) =>
                                    task.completed &&
                                    task.completed_at &&
                                    new Date(task.completed_at).toDateString() ===
                                        new Date().toDateString(),
                            ).length || 0;

                        const totalToday =
                            connection.tasks?.filter(
                                (task) =>
                                    task.due_date ===
                                    new Date().toISOString().split("T")[0],
                            ).length || 0;

                        return (
                            <Card key={connection.id}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-3 flex-1">
                                            <div>
                                                <p className="font-semibold text-lg">
                                                    {connection.profile.full_name ||
                                                        connection.profile.email}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    PIN: {connection.profile.user_pin}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
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
                                                    <span className="text-sm">
                                                        <span className="font-bold">
                                                            {connection.profile.current_streak}
                                                        </span>{" "}
                                                        day streak
                                                    </span>
                                                </div>

                                                <Badge variant="secondary">
                                                    {completedToday}/{totalToday} tasks today
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
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
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                        <p className="text-lg font-medium mb-1">
                            No connections yet
                        </p>
                        <p className="text-sm">
                            Connect with friends to track progress together!
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
