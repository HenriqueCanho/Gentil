import { supabase } from './supabase';
import {
  loadOnboardingResponses,
  type OnboardingResponses,
} from '../utils/onboarding';

export type Profile = {
  id: string;
  user_id: string;
  name: string | null;
  relationship_status: string | null;
  is_religious: string | null;
  signo: string | null;
  recent_feeling: string | null;
  feeling_cause: string | null;
  time_dedication: string | null;
  start_goal: string | null;
  categories: string[];
  troubles: string | null;
  avoidance: string | null;
  goals: string | null;
  goals_avoidance: string | null;
  onboarding_completed: boolean;
  created_at: string;
};

export async function syncOnboardingToSupabase(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const r: OnboardingResponses = await loadOnboardingResponses();

  await supabase.from('profiles').upsert(
    {
      user_id: user.id,
      name: r.name ?? null,
      relationship_status: r.relationshipStatus ?? null,
      is_religious: r.isReligious ?? null,
      signo: r.signo ?? null,
      recent_feeling: r.recentFeeling ?? null,
      feeling_cause: r.feelingCause ?? null,
      time_dedication: r.timeDedication ?? null,
      start_goal: r.startGoal ?? null,
      categories: r.categories ?? [],
      troubles: r.troubles ?? null,
      avoidance: r.avoidance ?? null,
      goals: r.goals ?? null,
      goals_avoidance: r.goalsAvoidance ?? null,
      onboarding_completed: true,
    },
    { onConflict: 'user_id' }
  );

  // Save notification preferences
  if (r.notificationsPerDay) {
    await supabase.from('user_notification_prefs').upsert(
      {
        user_id: user.id,
        per_day: r.notificationsPerDay,
        start_time: r.notificationStartTime ?? '08:00',
        end_time: r.notificationEndTime ?? '21:00',
        enabled: true,
      },
      { onConflict: 'user_id' }
    );
  }
}

export async function getProfile(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return data as Profile | null;
}
