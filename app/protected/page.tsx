import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedPage() {
    const supabase = await createClient();

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        redirect("/auth/login");
    }

    return (
        <div className="flex-1 w-full flex flex-col gap-8">
            <div className="w-full">
                <h1 className="text-2xl font-semibold mb-2">Welcome to WindDown</h1>
                <p className="text-muted-foreground">
                    Signed in as {user.email}
                </p>
            </div>

            <div className="w-full">
                <h2 className="text-lg font-medium mb-4">Your Tasks</h2>
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                    <p>No tasks yet. Start adding your tasks to get organized.</p>
                </div>
            </div>
        </div>
    );
}
