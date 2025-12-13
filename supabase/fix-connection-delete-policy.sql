-- Allow users to delete connections where they are either the sender or receiver
-- This enables bidirectional peer removal

-- First, check existing policies
-- You can run: SELECT * FROM pg_policies WHERE tablename = 'connections';

-- Drop the existing delete policy if it exists
DROP POLICY IF EXISTS "Users can delete their own connections" ON connections;

-- Create new delete policy that allows deletion from both sides
CREATE POLICY "Users can delete connections (bidirectional)"
  ON connections FOR DELETE
  USING (
    auth.uid() = user_id OR auth.uid() = connected_user_id
  );
