-- ------------------------------------------------------------
-- USER REPOSTS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_reposts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  affirmation_id uuid NOT NULL REFERENCES public.affirmations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, affirmation_id)
);

CREATE INDEX IF NOT EXISTS user_reposts_user_idx
  ON public.user_reposts (user_id, created_at DESC);

ALTER TABLE public.user_reposts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_reposts'
      AND policyname = 'users_own_reposts'
  ) THEN
    CREATE POLICY "users_own_reposts"
      ON public.user_reposts FOR ALL TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END
$$;
