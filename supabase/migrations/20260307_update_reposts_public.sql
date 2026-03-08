-- Add is_public column to user_reposts table
ALTER TABLE public.user_reposts 
ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;
