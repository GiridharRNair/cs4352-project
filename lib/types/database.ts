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
