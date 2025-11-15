-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  user_pin text unique not null,
  current_streak int default 0,
  longest_streak int default 0,
  last_activity_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create tasks table
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  completed boolean default false,
  completed_at timestamp with time zone,
  due_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create connections table (peer relationships)
create table connections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  connected_user_id uuid references profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, connected_user_id)
);

-- Create daily_activity table for tracking streaks
create table daily_activity (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  activity_date date not null,
  tasks_completed int default 0,
  tasks_created int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, activity_date)
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table tasks enable row level security;
alter table connections enable row level security;
alter table daily_activity enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can search profiles by PIN"
  on profiles for select
  using (true);

create policy "Users can view connected profiles"
  on profiles for select
  using (
    id in (
      select connected_user_id from connections
      where user_id = auth.uid() and status = 'accepted'
    )
  );

-- Tasks policies
create policy "Users can view their own tasks"
  on tasks for select
  using (auth.uid() = user_id);

create policy "Users can create their own tasks"
  on tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on tasks for delete
  using (auth.uid() = user_id);

create policy "Connected users can view tasks"
  on tasks for select
  using (
    user_id in (
      select connected_user_id from connections
      where user_id = auth.uid() and status = 'accepted'
    )
  );

-- Connections policies
create policy "Users can view their own connections"
  on connections for select
  using (auth.uid() = user_id or auth.uid() = connected_user_id);

create policy "Users can create connections"
  on connections for insert
  with check (auth.uid() = user_id);

create policy "Users can update connections they're part of"
  on connections for update
  using (auth.uid() = user_id or auth.uid() = connected_user_id);

-- Daily activity policies
create policy "Users can view their own activity"
  on daily_activity for select
  using (auth.uid() = user_id);

create policy "Users can insert their own activity"
  on daily_activity for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own activity"
  on daily_activity for update
  using (auth.uid() = user_id);

create policy "Connected users can view activity"
  on daily_activity for select
  using (
    user_id in (
      select connected_user_id from connections
      where user_id = auth.uid() and status = 'accepted'
    )
  );

-- Function to generate unique 6-digit PIN
create or replace function generate_user_pin()
returns text as $$
declare
  new_pin text;
  pin_exists boolean;
begin
  loop
    new_pin := lpad(floor(random() * 1000000)::text, 6, '0');
    select exists(select 1 from profiles where user_pin = new_pin) into pin_exists;
    exit when not pin_exists;
  end loop;
  return new_pin;
end;
$$ language plpgsql security definer;

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_pin text;
begin
  -- Generate PIN
  user_pin := generate_user_pin();
  
  -- Insert profile
  insert into public.profiles (id, email, full_name, avatar_url, user_pin)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    user_pin
  );
  return new;
exception
  when others then
    raise log 'Error creating profile for user %: %', new.id, sqlerrm;
    return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Trigger to create profile on user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Function to update streak
create or replace function update_user_streak(user_uuid uuid)
returns void as $$
declare
  last_date date;
  today date := current_date;
begin
  select last_activity_date into last_date from profiles where id = user_uuid;
  
  if last_date is null or last_date < today - interval '1 day' then
    -- Streak broken or first activity
    if last_date = today - interval '1 day' then
      -- Continue streak
      update profiles
      set current_streak = current_streak + 1,
          longest_streak = greatest(longest_streak, current_streak + 1),
          last_activity_date = today,
          updated_at = now()
      where id = user_uuid;
    else
      -- Start new streak
      update profiles
      set current_streak = 1,
          longest_streak = greatest(longest_streak, 1),
          last_activity_date = today,
          updated_at = now()
      where id = user_uuid;
    end if;
  end if;
end;
$$ language plpgsql;

-- Function to record daily activity
create or replace function record_daily_activity()
returns trigger as $$
begin
  if new.completed = true and (old.completed = false or old.completed is null) then
    insert into daily_activity (user_id, activity_date, tasks_completed)
    values (new.user_id, current_date, 1)
    on conflict (user_id, activity_date)
    do update set tasks_completed = daily_activity.tasks_completed + 1;
    
    perform update_user_streak(new.user_id);
  end if;
  return new;
end;
$$ language plpgsql;

-- Trigger to update daily activity when task is completed
create trigger on_task_completed
  after update on tasks
  for each row
  execute procedure record_daily_activity();

-- Function to get time until next day (for countdown)
create or replace function time_until_next_day()
returns interval as $$
begin
  return (date_trunc('day', now() + interval '1 day') - now());
end;
$$ language plpgsql;

-- Create indexes for better performance
create index idx_tasks_user_id on tasks(user_id);
create index idx_tasks_completed on tasks(completed);
create index idx_connections_user_id on connections(user_id);
create index idx_connections_connected_user_id on connections(connected_user_id);
create index idx_connections_status on connections(status);
create index idx_daily_activity_user_id on daily_activity(user_id);
create index idx_daily_activity_date on daily_activity(activity_date);
create index idx_profiles_user_pin on profiles(user_pin);
