-- ============================================================
-- Gentil - Core schema migration
-- Safe to run in Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- AFFIRMATION CATEGORIES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.affirmation_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- AFFIRMATIONS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.affirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  texto text NOT NULL,
  categoria text NOT NULL,
  linguagem text NOT NULL DEFAULT 'pt-BR',
  tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS affirmations_created_at_idx
  ON public.affirmations (created_at DESC);

CREATE INDEX IF NOT EXISTS affirmations_categoria_idx
  ON public.affirmations (categoria);

ALTER TABLE public.affirmations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'affirmations'
      AND policyname = 'authenticated_read_affirmations'
  ) THEN
    CREATE POLICY "authenticated_read_affirmations"
      ON public.affirmations FOR SELECT TO authenticated USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'affirmations'
      AND policyname = 'authenticated_insert_affirmations'
  ) THEN
    CREATE POLICY "authenticated_insert_affirmations"
      ON public.affirmations FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END
$$;

-- ------------------------------------------------------------
-- PROFILES (onboarding data)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  relationship_status text,
  is_religious text,
  signo text,
  recent_feeling text,
  feeling_cause text,
  time_dedication text,
  start_goal text,
  categories text[] DEFAULT '{}',
  troubles text,
  avoidance text,
  goals text,
  goals_avoidance text,
  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'users_own_profile'
  ) THEN
    CREATE POLICY "users_own_profile"
      ON public.profiles FOR ALL TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END
$$;

-- ------------------------------------------------------------
-- USER FAVORITES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  affirmation_id uuid NOT NULL REFERENCES public.affirmations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, affirmation_id)
);

CREATE INDEX IF NOT EXISTS user_favorites_user_idx
  ON public.user_favorites (user_id, created_at DESC);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_favorites'
      AND policyname = 'users_own_favorites'
  ) THEN
    CREATE POLICY "users_own_favorites"
      ON public.user_favorites FOR ALL TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END
$$;

-- ------------------------------------------------------------
-- USER READ HISTORY
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_read_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  affirmation_id uuid NOT NULL REFERENCES public.affirmations(id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_read_history_user_idx
  ON public.user_read_history (user_id, read_at DESC);

ALTER TABLE public.user_read_history ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_read_history'
      AND policyname = 'users_own_history'
  ) THEN
    CREATE POLICY "users_own_history"
      ON public.user_read_history FOR ALL TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END
$$;

-- ------------------------------------------------------------
-- USER STREAKS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_activity_date date,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_streaks'
      AND policyname = 'users_own_streaks'
  ) THEN
    CREATE POLICY "users_own_streaks"
      ON public.user_streaks FOR ALL TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END
$$;

-- ------------------------------------------------------------
-- USER NOTIFICATION PREFS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_notification_prefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  per_day integer NOT NULL DEFAULT 10,
  start_time text NOT NULL DEFAULT '08:00',
  end_time text NOT NULL DEFAULT '21:00',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_notification_prefs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_notification_prefs'
      AND policyname = 'users_own_notif_prefs'
  ) THEN
    CREATE POLICY "users_own_notif_prefs"
      ON public.user_notification_prefs FOR ALL TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END
$$;

-- ------------------------------------------------------------
-- PUSH TOKENS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL,
  platform text NOT NULL DEFAULT 'expo',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'push_tokens'
      AND policyname = 'users_own_push_tokens'
  ) THEN
    CREATE POLICY "users_own_push_tokens"
      ON public.push_tokens FOR ALL TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END
$$;

-- ------------------------------------------------------------
-- Seed initial affirmations (idempotent by texto + linguagem)
-- ------------------------------------------------------------
INSERT INTO public.affirmations (texto, categoria, linguagem)
SELECT seed.texto, seed.categoria, seed.linguagem
FROM (
  VALUES
    ('Eu sou capaz de grandes coisas.', 'Autoconfiança', 'pt-BR'),
    ('Hoje será um dia incrível.', 'Positividade', 'pt-BR'),
    ('Eu mereço tudo de bom que a vida tem a oferecer.', 'Amor próprio', 'pt-BR'),
    ('Minha mente é poderosa e positiva.', 'Diálogo interno', 'pt-BR'),
    ('Eu escolho a paz e a alegria todos os dias.', 'Positividade', 'pt-BR'),
    ('Estou crescendo e evoluindo a cada dia.', 'Propósito', 'pt-BR'),
    ('Sou grato(a) por tudo que tenho em minha vida.', 'Gratidão', 'pt-BR'),
    ('Confio em mim mesmo(a) e nas minhas decisões.', 'Autoconfiança', 'pt-BR'),
    ('Cada desafio me torna mais forte e sábio(a).', 'Resiliência', 'pt-BR'),
    ('Sou amado(a) e tenho imenso valor.', 'Amor próprio', 'pt-BR'),
    ('A cada respiração, sinto calma e paz.', 'Ansiedade', 'pt-BR'),
    ('Meu corpo merece cuidado e respeito.', 'Autocuidado', 'pt-BR'),
    ('Meu futuro está repleto de possibilidades.', 'Esperança', 'pt-BR'),
    ('Permito-me recomeçar sempre que preciso.', 'Motivação', 'pt-BR'),
    ('A gentileza começa comigo.', 'Gentileza', 'pt-BR')
) AS seed(texto, categoria, linguagem)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.affirmations a
  WHERE a.texto = seed.texto
    AND a.linguagem = seed.linguagem
);
