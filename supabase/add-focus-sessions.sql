-- Create focus_sessions table for tracking pomodoro/focus time
create table if not exists focus_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  task_id uuid references tasks(id) on delete cascade,
  duration_minutes int not null, -- planned duration (e.g., 25 for pomodoro)
  completed_minutes int default 0, -- actual time completed
  session_type text check (session_type in ('focus', 'break')) default 'focus',
  completed boolean default false,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table focus_sessions enable row level security;

-- Focus sessions policies
create policy "Users can view their own focus sessions"
  on focus_sessions for select
  using (auth.uid() = user_id);

create policy "Users can create their own focus sessions"
  on focus_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own focus sessions"
  on focus_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own focus sessions"
  on focus_sessions for delete
  using (auth.uid() = user_id);

-- Add total_focus_time to tasks table to track cumulative time
alter table tasks add column if not exists total_focus_time_minutes int default 0;
