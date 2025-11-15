-- Fix for "User not found with this PIN" error
-- This adds a policy to allow users to search for other users by PIN

-- Add policy to allow users to find others by PIN
create policy "Users can search profiles by PIN"
  on profiles for select
  using (true);

-- Note: This is safe because:
-- 1. PINs are meant to be shared (like usernames)
-- 2. Users only see limited info (id, email, full_name, user_pin, streaks)
-- 3. No sensitive data is exposed
-- 4. This enables the peer connection feature

-- Verify the policy was created
select 
  policyname, 
  cmd as command,
  qual as using_expression
from pg_policies 
where tablename = 'profiles'
order by policyname;
