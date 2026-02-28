import { supabase } from './supabase';

export type FavoriteAffirmation = {
  id: string;
  affirmation_id: string;
  texto: string;
  categoria: string;
  created_at: string;
};

export async function isFavorited(affirmationId: string): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('user_favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('affirmation_id', affirmationId)
    .maybeSingle();

  return data !== null;
}

export async function toggleFavorite(affirmationId: string): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('user_favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('affirmation_id', affirmationId)
    .maybeSingle();

  if (data) {
    await supabase.from('user_favorites').delete().eq('id', data.id);
    return false;
  } else {
    await supabase
      .from('user_favorites')
      .insert({ user_id: user.id, affirmation_id: affirmationId });
    return true;
  }
}

export async function listFavorites(): Promise<FavoriteAffirmation[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('user_favorites')
    .select(
      `
      id,
      affirmation_id,
      created_at,
      affirmations (texto, categoria)
    `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    affirmation_id: row.affirmation_id,
    texto: row.affirmations?.texto ?? '',
    categoria: row.affirmations?.categoria ?? '',
    created_at: row.created_at,
  }));
}

export async function removeFavorite(affirmationId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('affirmation_id', affirmationId);
}
