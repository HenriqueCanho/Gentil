import { supabase } from './supabase';

export type RepostedAffirmation = {
  id: string;
  affirmation_id: string;
  texto: string;
  categoria: string;
  created_at: string;
  is_public: boolean;
};

export async function isReposted(affirmationId: string): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('user_reposts')
    .select('id')
    .eq('user_id', user.id)
    .eq('affirmation_id', affirmationId)
    .maybeSingle();

  return data !== null;
}

export async function toggleRepost(affirmationId: string): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('user_reposts')
    .select('id')
    .eq('user_id', user.id)
    .eq('affirmation_id', affirmationId)
    .maybeSingle();

  if (data) {
    await supabase.from('user_reposts').delete().eq('id', data.id);
    return false;
  } else {
    await supabase
      .from('user_reposts')
      .insert({ user_id: user.id, affirmation_id: affirmationId });
    return true;
  }
}

export async function listReposts(): Promise<RepostedAffirmation[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('user_reposts')
    .select(
      `
      id,
      affirmation_id,
      created_at,
      is_public,
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
    is_public: row.is_public ?? false,
  }));
}

export async function togglePublicStatus(repostId: string, isPublic: boolean): Promise<void> {
  await supabase
    .from('user_reposts')
    .update({ is_public: isPublic })
    .eq('id', repostId);
}

export async function removeRepost(affirmationId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('user_reposts')
    .delete()
    .eq('user_id', user.id)
    .eq('affirmation_id', affirmationId);
}
