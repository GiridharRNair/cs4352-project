-- Fix #1: Allow connected peers to view each other's tasks (bidirectional)
create policy "Connected users can view each other's tasks"
  on tasks for select
  using (
    user_id in (
      select connected_user_id from connections
      where user_id = auth.uid() and status = 'accepted'
      union
      select user_id from connections
      where connected_user_id = auth.uid() and status = 'accepted'
    )
  );

-- Fix #2: Update activity feed policy to be bidirectional
drop policy if exists "Connected users can view activity" on activity_feed;

create policy "Connected users can view activity (bidirectional)"
  on activity_feed for select
  using (
    user_id in (
      select connected_user_id from connections
      where user_id = auth.uid() and status = 'accepted'
      union
      select user_id from connections
      where connected_user_id = auth.uid() and status = 'accepted'
    )
  );

-- Fix #3: Update peer reactions insert policy to be bidirectional
drop policy if exists "Users can send reactions to connected peers" on peer_reactions;

create policy "Users can send reactions to connected peers (bidirectional)"
  on peer_reactions for insert
  with check (
    auth.uid() = from_user_id and
    to_user_id in (
      select connected_user_id from connections
      where user_id = auth.uid() and status = 'accepted'
      union
      select user_id from connections
      where connected_user_id = auth.uid() and status = 'accepted'
    )
  );
