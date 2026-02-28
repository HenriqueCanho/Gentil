-- ============================================================
-- Gentil — Schema completo
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────────────────────────
-- AFFIRMATION CATEGORIES
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.affirmation_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────
-- AFFIRMATIONS
-- ──────────────────────────────────────────────────────────────
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

CREATE POLICY IF NOT EXISTS "authenticated_read_affirmations"
  ON public.affirmations FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "authenticated_insert_affirmations"
  ON public.affirmations FOR INSERT TO authenticated WITH CHECK (true);

-- ──────────────────────────────────────────────────────────────
-- PROFILES (onboarding data)
-- ──────────────────────────────────────────────────────────────
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

CREATE POLICY IF NOT EXISTS "users_own_profile"
  ON public.profiles FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ──────────────────────────────────────────────────────────────
-- USER FAVORITES
-- ──────────────────────────────────────────────────────────────
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

CREATE POLICY IF NOT EXISTS "users_own_favorites"
  ON public.user_favorites FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ──────────────────────────────────────────────────────────────
-- USER READ HISTORY
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_read_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  affirmation_id uuid NOT NULL REFERENCES public.affirmations(id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_read_history_user_idx
  ON public.user_read_history (user_id, read_at DESC);

ALTER TABLE public.user_read_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "users_own_history"
  ON public.user_read_history FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ──────────────────────────────────────────────────────────────
-- USER STREAKS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_activity_date date,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "users_own_streaks"
  ON public.user_streaks FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ──────────────────────────────────────────────────────────────
-- USER NOTIFICATION PREFS
-- ──────────────────────────────────────────────────────────────
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

CREATE POLICY IF NOT EXISTS "users_own_notif_prefs"
  ON public.user_notification_prefs FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ──────────────────────────────────────────────────────────────
-- PUSH TOKENS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL,
  platform text NOT NULL DEFAULT 'expo',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "users_own_push_tokens"
  ON public.push_tokens FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ──────────────────────────────────────────────────────────────
-- SEED: sample affirmations
-- ──────────────────────────────────────────────────────────────
INSERT INTO public.affirmations (texto, categoria, linguagem) VALUES
  ('Eu sou capaz de grandes coisas.', 'autoconfianca', 'pt-BR'),
  ('Hoje será um dia incrível.', 'Positividade', 'pt-BR'),
  ('Eu mereço tudo de bom que a vida tem a oferecer.', 'Amor próprio', 'pt-BR'),
  ('Minha mente é poderosa e positiva.', 'Diálogo interno', 'pt-BR'),
  ('Eu escolho a paz e a alegria todos os dias.', 'Positividade', 'pt-BR'),
  ('Estou crescendo e evoluindo a cada dia.', 'Propósito', 'pt-BR'),
  ('Sou grato(a) por tudo que tenho em minha vida.', 'Positividade', 'pt-BR'),
  ('Minha energia atrai coisas boas e pessoas incríveis.', 'Atração', 'pt-BR'),
  ('Confio em mim mesmo(a) e nas minhas decisões.', 'autoconfianca', 'pt-BR'),
  ('Cada desafio me torna mais forte e sábio(a).', 'Pensar demais', 'pt-BR'),
  ('Sou amado(a) e tenho imenso valor.', 'Amor próprio', 'pt-BR'),
  ('Hoje me dedico ao meu melhor com calma e foco.', 'Manhã', 'pt-BR'),
  ('Paz e prosperidade fluem para mim naturalmente.', 'Positividade', 'pt-BR'),
  ('Escolho ver o lado positivo de cada situação.', 'Positividade', 'pt-BR'),
  ('Sou suficiente exatamente como sou.', 'Amor próprio', 'pt-BR'),
  ('Minha jornada é única e especial.', 'Propósito', 'pt-BR'),
  ('Atraio oportunidades incríveis que combinam comigo.', 'Sonhar grande', 'pt-BR'),
  ('Me cuido com amor, carinho e respeito.', 'Amor próprio', 'pt-BR'),
  ('Minha vida melhora a cada dia que passa.', 'Positividade', 'pt-BR'),
  ('Tenho tudo que preciso dentro de mim.', 'Diálogo interno', 'pt-BR'),
  ('Respiro fundo e libero toda tensão.', 'Ansiedade', 'pt-BR'),
  ('A ansiedade passa, e eu continuo firme.', 'Ansiedade', 'pt-BR'),
  ('Meu coração se abre para o amor verdadeiro.', 'Romance', 'pt-BR'),
  ('Mereço relações saudáveis e amorosas.', 'Romance', 'pt-BR'),
  ('Cada manhã é uma nova oportunidade de recomeçar.', 'Manhã', 'pt-BR'),
  ('Acordo cheio(a) de energia e gratidão.', 'Manhã', 'pt-BR'),
  ('Sonho grande e acredito que é possível.', 'Sonhar grande', 'pt-BR'),
  ('O universo conspira a meu favor.', 'Sonhar grande', 'pt-BR'),
  ('Ouço minha voz interior com atenção e carinho.', 'Diálogo interno', 'pt-BR'),
  ('Cuido da criança interior que vive em mim.', 'Criança interior', 'pt-BR')
  ('Tenho o poder de criar o meu futuro.', 'Criar o futuro', 'pt-BR'),
  ('Aceito meu passado e confio no meu futuro.', 'Autoaceitação', 'pt-BR'),
  ('Eu escolho ser feliz independentemente das circunstâncias.', 'Positividade', 'pt-BR'),
  ('Sou capaz de superar qualquer dificuldade.', 'Resiliência', 'pt-BR'),
  ('A cada dia, me torno uma versão melhor de mim mesmo(a).', 'Crescimento pessoal', 'pt-BR'),
  ('Permito-me descansar e recarregar minhas energias.', 'Autocuidado', 'pt-BR'),
  ('Eu me perdôo e sigo em frente com leveza.', 'Perdão', 'pt-BR'),
  ('Meu corpo é forte e saudável.', 'Saúde', 'pt-BR'),
  ('Acredito no poder dos meus sonhos.', 'Sonhar grande', 'pt-BR'),
  ('Eu me expresso com clareza e confiança.', 'Comunicação', 'pt-BR'),
  ('Sou dono(a) das minhas escolhas.', 'Autonomia', 'pt-BR'),
  ('Confio no fluxo da vida.', 'Confiança', 'pt-BR'),
  ('Encontro beleza nas pequenas coisas do cotidiano.', 'Gratidão', 'pt-BR'),
  ('Me conecto com pessoas que me fazem bem.', 'Relacionamentos', 'pt-BR'),
  ('Eu mereço descanso e momentos de paz.', 'Autocuidado', 'pt-BR'),
  ('Me desafio a sair da zona de conforto.', 'Crescimento pessoal', 'pt-BR'),
  ('Sinto orgulho das minhas conquistas.', 'Orgulho', 'pt-BR'),
  ('Tenho coragem para enfrentar meus medos.', 'Coragem', 'pt-BR'),
  ('Escolho cultivar pensamentos positivos.', 'Positividade', 'pt-BR'),
  ('Reconheço meu valor todos os dias.', 'Autoestima', 'pt-BR'),
  ('Estou presente no momento.', 'Mindfulness', 'pt-BR'),
  ('Me permito aprender com os erros.', 'Aprendizado', 'pt-BR'),
  ('Atraio abundância e prosperidade.', 'Abundância', 'pt-BR'),
  ('Dedico tempo para cuidar de mim.', 'Autocuidado', 'pt-BR'),
  ('Eu inspiro pessoas ao meu redor.', 'Inspiração', 'pt-BR'),
  ('Transformo desafios em oportunidades.', 'Resiliência', 'pt-BR'),
  ('Respeito meus limites e me escuto.', 'Autoconhecimento', 'pt-BR'),
  ('Tenho calma para lidar com situações difíceis.', 'Equilíbrio emocional', 'pt-BR'),
  ('Minha presença é suficiente.', 'Autoaceitação', 'pt-BR'),
  ('Sou fonte de amor e compaixão.', 'Amor próprio', 'pt-BR'),
  ('Celebro minhas pequenas vitórias.', 'Gratidão', 'pt-BR'),
  ('Estou aberto(a) a novas experiências.', 'Mudanças', 'pt-BR'),
  ('Meu coração está em paz.', 'Tranquilidade', 'pt-BR'),
  ('Reconheço e acolho meus sentimentos.', 'Inteligência emocional', 'pt-BR'),
  ('Eu irradio luz por onde passo.', 'Inspiração', 'pt-BR'),
  ('Tenho sabedoria para tomar boas decisões.', 'Sabedoria', 'pt-BR'),
  ('Hoje é um novo começo.', 'Motivação', 'pt-BR'),
  ('Estou no comando da minha vida.', 'Autonomia', 'pt-BR'),
  ('Me permito pedir ajuda quando necessário.', 'Vulnerabilidade', 'pt-BR'),
  ('Agradeço por quem sou e quem estou me tornando.', 'Gratidão', 'pt-BR'),
  ('Meu tempo é precioso e faço boas escolhas.', 'Prioridades', 'pt-BR'),
  ('Confio que o melhor está por vir.', 'Esperança', 'pt-BR'),
  ('Minha criatividade flui livremente.', 'Criatividade', 'pt-BR'),
  ('Eu me respeito e respeito os outros.', 'Respeito', 'pt-BR'),
  ('Posso transformar meus pensamentos.', 'Crescimento pessoal', 'pt-BR'),
  ('Eu aceito os altos e baixos da vida com gratidão.', 'Equilíbrio emocional', 'pt-BR'),
  ('Permito que o amor entre em minha vida.', 'Romance', 'pt-BR'),
  ('Valorizo os momentos simples.', 'Gratidão', 'pt-BR'),
  ('Eu faço a diferença no mundo.', 'Propósito', 'pt-BR'),
  ('Meu entusiasmo contagia quem está ao meu redor.', 'Otimismo', 'pt-BR'),
  ('Estou aprendendo a confiar em mim mesmo(a).', 'Confiança', 'pt-BR')
  ,('Me permito sentir felicidade plenamente.', 'Felicidade', 'pt-BR')
  ,('Cada dia é uma nova oportunidade.', 'Motivação', 'pt-BR')
  ,('Aceito e celebro minha singularidade.', 'Autoaceitação', 'pt-BR')
  ,('Confio em minhas escolhas.', 'Autoconfiança', 'pt-BR')
  ,('Estou aqui para aprender e evoluir.', 'Aprendizado', 'pt-BR')
  ,('Sou grato(a) pelas pessoas que me apoiam.', 'Gratidão', 'pt-BR')
  ,('Meu corpo merece cuidado e respeito.', 'Autocuidado', 'pt-BR')
  ,('Libero crenças que não me servem mais.', 'Mudanças', 'pt-BR')
  ,('Minha voz merece ser ouvida.', 'Comunicação', 'pt-BR')
  ,('O amor é abundante em minha vida.', 'Amor próprio', 'pt-BR')
  ,('A tranquilidade me envolve neste momento.', 'Tranquilidade', 'pt-BR')
  ,('Confio no processo da vida.', 'Confiança', 'pt-BR')
  ,('Meu coração está aberto para novas amizades.', 'Relacionamentos', 'pt-BR')
  ,('Permito-me crescer todos os dias.', 'Crescimento pessoal', 'pt-BR')
  ,('Eu escolho ver o lado bom das coisas.', 'Positividade', 'pt-BR')
  ,('A cada respiração, sinto calma e paz.', 'Mindfulness', 'pt-BR')
  ,('Hoje acolho minhas emoções com gentileza.', 'Inteligência emocional', 'pt-BR')
  ,('Eu mereço receber coisas boas.', 'Autoestima', 'pt-BR')
  ,('Valorizar o presente me faz bem.', 'Gratidão', 'pt-BR')
  ,('Divido alegria com quem amo.', 'Amor e família', 'pt-BR')
  ,('Eu sou resiliente diante dos desafios.', 'Resiliência', 'pt-BR')
  ,('Minha autenticidade é meu maior valor.', 'Autenticidade', 'pt-BR')
  ,('Celebro minhas conquistas, grandes e pequenas.', 'Orgulho', 'pt-BR')
  ,('Estou aberto(a) para aprender algo novo hoje.', 'Aprendizado', 'pt-BR')
  ,('Escolho pensamentos que me fortalecem.', 'Pensamento positivo', 'pt-BR')
  ,('Cuido do meu corpo com carinho.', 'Saúde', 'pt-BR')
  ,('Mereço um tempo só para mim.', 'Autocuidado', 'pt-BR')
  ,('Reconheço minhas qualidades diariamente.', 'Autoestima', 'pt-BR')
  ,('Eu sou suficiente exatamente como sou.', 'Autoaceitação', 'pt-BR')
  ,('Permito que a alegria me preencha.', 'Felicidade', 'pt-BR')
  ,('Sinto orgulho da minha história.', 'Orgulho', 'pt-BR')
  ,('Meu futuro está repleto de possibilidades.', 'Esperança', 'pt-BR')
  ,('A bondade faz parte do meu caminho.', 'Gentileza', 'pt-BR')
  ,('Aceito com leveza aquilo que não posso controlar.', 'Equilíbrio emocional', 'pt-BR')
  ,('Sou capaz de fazer a diferença.', 'Propósito', 'pt-BR')
  ,('Permito-me expressar minha criatividade.', 'Criatividade', 'pt-BR')
  ,('Cuido da minha saúde mental diariamente.', 'Saúde mental', 'pt-BR')
  ,('Meus erros são oportunidades de crescimento.', 'Aprendizado', 'pt-BR')
  ,('Agradeço pelas pequenas conquistas do dia.', 'Gratidão', 'pt-BR')
  ,('Encontro beleza em mim e no outro.', 'Relacionamentos', 'pt-BR')
  ,('Tenho força para superar este momento.', 'Resiliência', 'pt-BR')
  ,('Respeito meus sentimentos e limites.', 'Autoconhecimento', 'pt-BR')
  ,('Confio no meu potencial.', 'Autoconfiança', 'pt-BR')
  ,('A vida me surpreende de maneiras positivas.', 'Otimismo', 'pt-BR')
  ,('Me permito recomeçar sempre que preciso.', 'Motivação', 'pt-BR')
  ,('Posso transformar qualquer situação.', 'Resiliência', 'pt-BR')
  ,('Eu inspiro quem me cerca pelo exemplo.', 'Inspiração', 'pt-BR')
  ,('Meu tempo é valioso.', 'Prioridades', 'pt-BR')
  ,('Cuido da minha energia e a direciono para o bem.', 'Autocuidado', 'pt-BR')
  ,('Estou disposto(a) a aprender novas habilidades.', 'Aprendizado', 'pt-BR')
  ,('A gentileza começa comigo.', 'Gentileza', 'pt-BR')
  ,('Permito-me viver o hoje.', 'Mindfulness', 'pt-BR')
  ,('Escolho alimentar minha mente com otimismo.', 'Pensamento positivo', 'pt-BR')
  ,('Sou digno(a) de respeito.', 'Respeito', 'pt-BR')
  ,('Há beleza em ser vulnerável.', 'Vulnerabilidade', 'pt-BR')
  ,('O perdão me liberta para seguir em frente.', 'Perdão', 'pt-BR')
  ,('Meu caminho é único e especial.', 'Propósito', 'pt-BR')
  ,('Mereço ter segurança em minhas decisões.', 'Confiança', 'pt-BR')
  ,('A paz que procuro está dentro de mim.', 'Tranquilidade', 'pt-BR')
  ,('Estou conectando com minha essência.', 'Autoconhecimento', 'pt-BR')
  ,('Faço escolhas alinhadas com meus valores.', 'Autenticidade', 'pt-BR')
  ,('Me permito desacelerar quando preciso.', 'Autocuidado', 'pt-BR')
  ,('Enxergo oportunidades onde vejo desafios.', 'Otimismo', 'pt-BR')
  ,('Eu me reinvento sempre que a vida pede.', 'Mudanças', 'pt-BR')
  ,('Permito-me sentir orgulho de quem sou.', 'Orgulho', 'pt-BR')
  ,('Comparto sorrisos com generosidade.', 'Gentileza', 'pt-BR')
  ,('Tenho coragem de pedir ajuda.', 'Vulnerabilidade', 'pt-BR')
  ,('A cada dia, fortaleço minha autoestima.', 'Autoestima', 'pt-BR')
  ,('O autocuidado é um ato de amor próprio.', 'Autocuidado', 'pt-BR')
  ,('Meus sonhos são possíveis.', 'Sonhar grande', 'pt-BR')
  ,('Tenho direito de ser feliz.', 'Felicidade', 'pt-BR')
  ,('Minha presença é um presente.', 'Mindfulness', 'pt-BR')
  ,('Aceito e celebro minhas conquistas.', 'Gratidão', 'pt-BR')
  ,('Sou digno(a) de momentos de paz.', 'Tranquilidade', 'pt-BR')
  ,('Abraço as mudanças com confiança.', 'Mudanças', 'pt-BR')
  ,('Meu propósito é viver com autenticidade.', 'Propósito', 'pt-BR')
  ,('Mereço me sentir realizado(a).', 'Realização', 'pt-BR')
  ,('Eu creio na minha força interior.', 'Resiliência', 'pt-BR')
  ,('Permito-me ter esperança.', 'Esperança', 'pt-BR')
  ,('Faço as pazes com meu passado.', 'Autoaceitação', 'pt-BR')
  ,('Meu sorriso ilumina meu dia.', 'Felicidade', 'pt-BR')
  ,('Permito-me ter sucesso.', 'Motivação', 'pt-BR')
  ,('Posso recomeçar a qualquer momento.', 'Mudanças', 'pt-BR')
  ,('Eu crio abundância em minha vida.', 'Abundância', 'pt-BR')
  ,('Meu carinho por mim cresce todos os dias.', 'Amor próprio', 'pt-BR')
  ,('Ouço e respeito minhas necessidades.', 'Autoconhecimento', 'pt-BR')
  ,('Sou compassivo(a) comigo e com os outros.', 'Amor próprio', 'pt-BR')
  ,('Eu vivo o agora.', 'Mindfulness', 'pt-BR')
  ,('As oportunidades se apresentam para mim.', 'Otimismo', 'pt-BR')
  ,('Aceito minha jornada com gratidão.', 'Gratidão', 'pt-BR')
  ,('Aprendo com meus fracassos.', 'Aprendizado', 'pt-BR')
  ,('Permito-me ser humano.', 'Autoaceitação', 'pt-BR')
  ,('A gentileza transforma meu mundo.', 'Gentileza', 'pt-BR')
  ,('Eu mereço descansar sem culpa.', 'Autocuidado', 'pt-BR')
  ,('A vida é cheia de possibilidades positivas.', 'Otimismo', 'pt-BR')
  ,('Minha energia atrai pessoas do bem.', 'Relacionamentos', 'pt-BR')
  ,('Aprendo e evoluo a cada experiência.', 'Aprendizado', 'pt-BR')
  ,('Me permito sentir orgulho das minhas conquistas.', 'Orgulho', 'pt-BR')
  ,('Eu cultivo abundância com meus pensamentos.', 'Abundância', 'pt-BR')
  ,('Meu coração é meu guia.', 'Autoconhecimento', 'pt-BR')
ON CONFLICT DO NOTHING;
