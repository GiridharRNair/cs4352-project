-- Create daily_reflections table for end-of-day wind down ritual
create table if not exists daily_reflections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  reflection_date date not null,
  mood text check (mood in ('happy', 'neutral', 'sad')) not null,
  gratitude_note text,
  reflection_note text,
  tasks_completed_count int default 0,
  is_shared_with_peers boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, reflection_date)
);

-- Enable Row Level Security
alter table daily_reflections enable row level security;

-- Daily reflections policies
create policy "Users can view their own reflections"
  on daily_reflections for select
  using (auth.uid() = user_id);

create policy "Users can create their own reflections"
  on daily_reflections for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own reflections"
  on daily_reflections for update
  using (auth.uid() = user_id);

create policy "Users can delete their own reflections"
  on daily_reflections for delete
  using (auth.uid() = user_id);

-- Connected users can view shared reflections (bidirectional)
create policy "Connected users can view shared reflections"
  on daily_reflections for select
  using (
    is_shared_with_peers = true and
    user_id in (
      select connected_user_id from connections
      where user_id = auth.uid() and status = 'accepted'
      union
      select user_id from connections
      where connected_user_id = auth.uid() and status = 'accepted'
    )
  );

-- Create indexes for better performance
create index if not exists idx_daily_reflections_user on daily_reflections(user_id);
create index if not exists idx_daily_reflections_date on daily_reflections(reflection_date desc);
create index if not exists idx_daily_reflections_shared on daily_reflections(is_shared_with_peers) where is_shared_with_peers = true;
