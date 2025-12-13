export type Profile = {
    id: string;
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
    user_pin: string;
    current_streak: number;
    longest_streak: number;
    last_activity_date: string | null;
    created_at: string;
    updated_at: string;
};

export type Task = {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    completed: boolean;
    completed_at: string | null;
    due_date: string | null;
    total_focus_time_minutes: number;
    created_at: string;
    updated_at: string;
};

export type Connection = {
    id: string;
    user_id: string;
    connected_user_id: string;
    status: "pending" | "accepted" | "rejected";
    created_at: string;
    updated_at: string;
};

export type DailyActivity = {
    id: string;
    user_id: string;
    activity_date: string;
    tasks_completed: number;
    tasks_created: number;
    created_at: string;
};

export type ConnectionWithProfile = Connection & {
    profile: Profile;
};

export type TaskWithUser = Task & {
    user: Profile;
};

export type FocusSession = {
    id: string;
    user_id: string;
    task_id: string | null;
    duration_minutes: number;
    completed_minutes: number;
    session_type: "focus" | "break";
    completed: boolean;
    started_at: string;
    completed_at: string | null;
    created_at: string;
};

export type PeerReaction = {
    id: string;
    from_user_id: string;
    to_user_id: string;
    task_id: string | null;
    reaction_type: string;
    created_at: string;
};

export type ActivityFeed = {
    id: string;
    user_id: string;
    activity_type: "task_completed" | "streak_milestone" | "task_created";
    task_id: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
};

export type ActivityFeedWithProfile = ActivityFeed & {
    profile: Profile;
};
