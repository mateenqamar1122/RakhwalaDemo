-- Add user_id column to valuations table
ALTER TABLE public.valuations
ADD COLUMN IF NOT EXISTS user_id uuid references auth.users(id) on delete set null;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS valuations_user_id_idx ON public.valuations(user_id);

