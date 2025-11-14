-- Fix for "Database error saving new user" issue
-- Run this in Supabase SQL Editor if you're getting errors with new user creation

-- First, drop and recreate the trigger and function
drop trigger if exists on_auth_user_created on auth.users;

-- Recreate the function with better error handling
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_pin text;
  pin_exists boolean;
begin
  -- Generate unique PIN inline
  loop
    new_pin := lpad(floor(random() * 1000000)::text, 6, '0');
    select exists(select 1 from profiles where user_pin = new_pin) into pin_exists;
    exit when not pin_exists;
  end loop;
  
  -- Insert profile with error handling
  insert into public.profiles (id, email, full_name, avatar_url, user_pin)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    new_pin
  );
  
  return new;
exception
  when others then
    -- Log the error but don't fail the auth
    raise warning 'Error creating profile for user %: %', new.id, sqlerrm;
    return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Recreate the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Add insert policy if it doesn't exist
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'profiles' 
    and policyname = 'Users can insert their own profile'
  ) then
    create policy "Users can insert their own profile"
      on profiles for insert
      with check (auth.uid() = id);
  end if;
end $$;

-- Verify the setup
select 
  'Trigger created: ' || count(*)::text as status
from pg_trigger 
where tgname = 'on_auth_user_created';

select 
  'Policies count: ' || count(*)::text as status
from pg_policies 
where tablename = 'profiles';
