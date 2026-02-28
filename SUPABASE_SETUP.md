# Supabase no Gentil

## 1) Configurar autenticacao por e-mail

No painel do Supabase:

1. `Authentication` -> `Providers` -> `Email`.
2. Ative `Enable Email provider`.
3. Se quiser login sem confirmar e-mail no ambiente de desenvolvimento, ative `Confirm email` como opcional.

## 2) Criar tabela `affirmations`

No SQL Editor, execute o arquivo:

- `supabase/schema.sql`

Ou cole diretamente o SQL abaixo:

```sql
create extension if not exists "pgcrypto";

create table if not exists public.affirmations (
  id uuid primary key default gen_random_uuid(),
  texto text not null,
  categoria text not null,
  linguagem text not null default 'pt-BR',
  created_at timestamptz not null default now()
);

create index if not exists affirmations_created_at_idx
  on public.affirmations (created_at desc);

alter table public.affirmations enable row level security;

create policy "authenticated_can_read_affirmations"
  on public.affirmations
  for select
  to authenticated
  using (true);

create policy "authenticated_can_insert_affirmations"
  on public.affirmations
  for insert
  to authenticated
  with check (true);

create policy "authenticated_can_update_affirmations"
  on public.affirmations
  for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated_can_delete_affirmations"
  on public.affirmations
  for delete
  to authenticated
  using (true);
```

## 3) Configurar variaveis no app

Crie `.env` na raiz:

```env
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY
```

## 4) Exemplo de integracao React Native

Cliente Supabase: `src/lib/supabase.ts`

Servico de afirmacoes: `src/lib/affirmations.ts`

Exemplo pratico no app: `src/screens/DashboardScreen.tsx`

- `listAffirmations()`: busca ultimas afirmacoes
- `createAffirmation()`: cria afirmacao

## 5) Fluxo de auth por e-mail ja implementado

- Login: `supabase.auth.signInWithPassword`
- Registro: `supabase.auth.signUp`
- Logout: `supabase.auth.signOut`

As telas ficam em:

- `src/screens/LoginScreen.tsx`
- `src/screens/RegisterScreen.tsx`
- `src/screens/DashboardScreen.tsx`
