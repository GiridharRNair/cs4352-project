-- Create peer_reactions table for emoji reactions
create table if not exists peer_reactions (
  id uuid default uuid_generate_v4() primary key,
  from_user_id uuid references profiles(id) on delete cascade not null,
  to_user_id uuid references profiles(id) on delete cascade not null,
  task_id uuid references tasks(id) on delete cascade,
  reaction_type text not null, -- emoji: '🔥', '👏', '💪', '🎉', '❤️'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create activity_feed table for peer activity tracking
create table if not exists activity_feed (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  activity_type text check (activity_type in ('task_completed', 'streak_milestone', 'task_created')) not null,
  task_id uuid references tasks(id) on delete cascade,
  metadata jsonb, -- stores additional data like streak count, task title, etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table peer_reactions enable row level security;
alter table activity_feed enable row level security;

-- Peer reactions policies
create policy "Users can view reactions on their tasks"
  on peer_reactions for select
  using (
    auth.uid() = to_user_id or
    auth.uid() = from_user_id
  );

create policy "Users can send reactions to connected peers"
  on peer_reactions for insert
  with check (
    auth.uid() = from_user_id and
    to_user_id in (
      select connected_user_id from connections
      where user_id = auth.uid() and status = 'accepted'
    )
  );

create policy "Users can delete their own reactions"
  on peer_reactions for delete
  using (auth.uid() = from_user_id);

-- Activity feed policies
create policy "Users can view their own activity"
  on activity_feed for select
  using (auth.uid() = user_id);

create policy "Connected users can view activity"
  on activity_feed for select
  using (
    user_id in (
      select connected_user_id from connections
      where user_id = auth.uid() and status = 'accepted'
    )
  );

create policy "Users can create their own activity"
  on activity_feed for insert
  with check (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists idx_peer_reactions_to_user on peer_reactions(to_user_id);
create index if not exists idx_peer_reactions_task on peer_reactions(task_id);
create index if not exists idx_activity_feed_user on activity_feed(user_id);
create index if not exists idx_activity_feed_created on activity_feed(created_at desc);

-- Function to create activity feed entry when task is completed
create or replace function create_task_completion_activity()
returns trigger as $$
begin
  if NEW.completed = true and OLD.completed = false then
    insert into activity_feed (user_id, activity_type, task_id, metadata)
    values (
      NEW.user_id,
      'task_completed',
      NEW.id,
      jsonb_build_object('task_title', NEW.title, 'completed_at', NEW.completed_at)
    );
  end if;
  return NEW;
end;
$$ language plpgsql;

-- Create trigger for task completion
drop trigger if exists task_completion_activity_trigger on tasks;
create trigger task_completion_activity_trigger
  after update on tasks
  for each row
  execute function create_task_completion_activity();
