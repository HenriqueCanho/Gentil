import { supabase } from './supabase';

export type Affirmation = {
  id: string;
  texto: string;
  categoria: string;
  linguagem: string;
  created_at: string;
};

export async function listAffirmations(limit = 20): Promise<Affirmation[]> {
  const { data, error } = await supabase
    .from('affirmations')
    .select('id, texto, categoria, linguagem, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Affirmation[];
}

export async function listAffirmationsByCategory(
  categoria: string,
  limit = 30
): Promise<Affirmation[]> {
  const { data, error } = await supabase
    .from('affirmations')
    .select('id, texto, categoria, linguagem, created_at')
    .ilike('categoria', `%${categoria}%`)
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Affirmation[];
}

export async function listAffirmationsForUser(
  categories: string[],
  limit = 20
): Promise<Affirmation[]> {
  if (categories.length === 0) return listAffirmations(limit);

  const { data, error } = await supabase
    .from('affirmations')
    .select('id, texto, categoria, linguagem, created_at')
    .in('categoria', categories)
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Affirmation[];
}

export async function createAffirmation(
  payload: Pick<Affirmation, 'texto' | 'categoria' | 'linguagem'>
): Promise<Affirmation> {
  const { data, error } = await supabase
    .from('affirmations')
    .insert(payload)
    .select('id, texto, categoria, linguagem, created_at')
    .single();

  if (error) throw error;
  return data as Affirmation;
}

export async function recordAffirmationRead(affirmationId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('user_read_history').insert({
    user_id: user.id,
    affirmation_id: affirmationId,
  });
}
