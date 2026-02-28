# Gentil

Estrutura inicial de app React Native com Expo + TypeScript, com telas de login, registro e dashboard.

## Stack

- Expo (React Native)
- TypeScript
- Tailwind CSS via NativeWind
- Supabase (`@supabase/supabase-js`)
- Lucide (`lucide-react-native` e `lucide-react`)
- Reactix (`@tariqporter/reactix`)
- React Navigation

## Setup

1. Instale dependencias:

```bash
npm install
```

2. Crie seu `.env` baseado no exemplo:

```bash
cp .env.example .env
```

3. Configure:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

4. Configure o Supabase (auth por e-mail + tabela `affirmations`):

- Veja `SUPABASE_SETUP.md`
- SQL pronto em `supabase/schema.sql`

## Rodando

```bash
npm run start
npm run android
npm run ios
npm run web
```

## Estrutura principal

- `App.tsx`: roteamento e controle de sessao
- `src/lib/supabase.ts`: cliente Supabase
- `src/screens/LoginScreen.tsx`: tela de login
- `src/screens/RegisterScreen.tsx`: tela de cadastro
- `src/screens/DashboardScreen.tsx`: dashboard autenticado
