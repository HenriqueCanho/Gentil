import { supabase } from './supabase';

export async function loadUserStreak(): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data } = await supabase
    .from('user_streaks')
    .select('current_streak')
    .eq('user_id', user.id)
    .maybeSingle();

  return (data as any)?.current_streak ?? 0;
}

export async function incrementStreak(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const today = new Date().toISOString().split('T')[0];

  // Check if already recorded today
  const { data: existing } = await supabase
    .from('user_streaks')
    .select('id, current_streak, last_activity_date')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!existing) {
    await supabase.from('user_streaks').insert({
      user_id: user.id,
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: today,
    });
    return;
  }

  if (existing.last_activity_date === today) return;

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const isConsecutive = existing.last_activity_date === yesterday;
  const newStreak = isConsecutive ? existing.current_streak + 1 : 1;

  await supabase
    .from('user_streaks')
    .update({
      current_streak: newStreak,
      longest_streak: Math.max(newStreak, existing.current_streak),
      last_activity_date: today,
    })
    .eq('id', existing.id);
}
