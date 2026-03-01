import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, BookMarked, ChartColumn, Flame, Heart, Timer } from 'lucide-react-native';

import { listAffirmations } from '../lib/affirmations';
import { listFavorites } from '../lib/favorites';
import { loadNotificationPrefs } from '../lib/notifications';
import { getProfile } from '../lib/profiles';
import { loadUserStreak } from '../lib/streaks';
import { supabase } from '../lib/supabase';
import { COLORS } from '../theme/colors';
import { loadOnboardingResponses } from '../utils/onboarding';

type CardProps = {
  title: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
};

function StatCard({ title, value, hint, icon }: CardProps) {
  return (
    <View className="w-[48%] rounded-2xl border border-gentil-border bg-gentil-input p-4">
      <View className="mb-2">{icon}</View>
      <Text className="font-fraunces text-xs text-gentil-muted">{title}</Text>
      <Text className="mt-1 font-fraunces-bold text-2xl text-white">{value}</Text>
      <Text className="mt-1 font-fraunces text-xs text-gentil-muted">{hint}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [perDay, setPerDay] = useState(0);
  const [windowHours, setWindowHours] = useState(0);
  const [onboardingCompletion, setOnboardingCompletion] = useState(0);
  const [daysUsingApp, setDaysUsingApp] = useState(0);
  const [readCount, setReadCount] = useState(0);
  const [totalAffirmations, setTotalAffirmations] = useState(0);

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const [
        streakValue,
        favorites,
        prefs,
        onboarding,
        profile,
        affirmations,
        {
          data: { user },
        },
      ] = await Promise.all([
        loadUserStreak(),
        listFavorites(),
        loadNotificationPrefs(),
        loadOnboardingResponses(),
        getProfile(),
        listAffirmations(200),
        supabase.auth.getUser(),
      ]);

      setStreak(streakValue);
      setFavoritesCount(favorites.length);
      setPerDay(prefs?.per_day ?? 0);
      setTotalAffirmations(affirmations.length);

      const start = prefs?.start_time ?? '08:00';
      const end = prefs?.end_time ?? '21:00';
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      const minutes = eh * 60 + em - (sh * 60 + sm);
      setWindowHours(Math.max(0, Math.round((minutes / 60) * 10) / 10));

      const answerableFields = 12;
      const answered = [
        onboarding.name,
        onboarding.relationshipStatus,
        onboarding.isReligious,
        onboarding.signo,
        onboarding.recentFeeling,
        onboarding.feelingCause,
        onboarding.timeDedication,
        onboarding.startGoal,
        onboarding.troubles,
        onboarding.avoidance,
        onboarding.goals,
        onboarding.goalsAvoidance,
      ].filter(Boolean).length;
      setOnboardingCompletion(Math.round((answered / answerableFields) * 100));

      if (profile?.created_at) {
        const created = new Date(profile.created_at).getTime();
        const diffDays = Math.max(1, Math.floor((Date.now() - created) / 86400000) + 1);
        setDaysUsingApp(diffDays);
      } else {
        setDaysUsingApp(1);
      }

      if (user) {
        const { count } = await supabase
          .from('user_read_history')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
        setReadCount(count ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const weeklyNotifications = useMemo(() => perDay * 7, [perDay]);

  if (loading) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 items-center justify-center bg-gentil-bg">
        <ActivityIndicator size="large" color={COLORS.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-gentil-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingBottom: 0 }}
      >
        <Text className="font-fraunces text-sm text-gentil-muted">Seu progresso</Text>
        <Text className="mt-1 font-fraunces-bold text-3xl text-white">Dashboard</Text>

        <View className="mt-6 flex-row flex-wrap justify-between gap-y-3">
          <StatCard
            title="Streak atual"
            value={`${streak}`}
            hint="dias consecutivos"
            icon={<Flame color={COLORS.accent} size={18} />}
          />
          <StatCard
            title="Favoritas"
            value={`${favoritesCount}`}
            hint="frases salvas"
            icon={<Heart color={COLORS.accent} size={18} />}
          />
          <StatCard
            title="Notificações/dia"
            value={`${perDay}`}
            hint={`${weeklyNotifications} por semana`}
            icon={<Bell color={COLORS.accent} size={18} />}
          />
          <StatCard
            title="Janela ativa"
            value={`${windowHours}h`}
            hint="de envio diário"
            icon={<Timer color={COLORS.accent} size={18} />}
          />
          <StatCard
            title="Onboarding"
            value={`${onboardingCompletion}%`}
            hint="dados completos"
            icon={<ChartColumn color={COLORS.accent} size={18} />}
          />
          <StatCard
            title="Leituras"
            value={`${readCount}`}
            hint="afirmações lidas"
            icon={<BookMarked color={COLORS.accent} size={18} />}
          />
        </View>

        <View className="mt-6 rounded-2xl border border-gentil-border bg-gentil-card p-5">
          <Text className="font-fraunces-semi text-base text-white">Insights rápidos</Text>
          <View className="mt-3 gap-2">
            <Text className="font-fraunces text-sm text-gentil-muted">
              - Você usa o app há {daysUsingApp} {daysUsingApp === 1 ? 'dia' : 'dias'}.
            </Text>
            <Text className="font-fraunces text-sm text-gentil-muted">
              - Existem {totalAffirmations} afirmações disponíveis no seu catálogo atual.
            </Text>
            <Text className="font-fraunces text-sm text-gentil-muted">
              - Com {perDay} notificações por dia, seu contato com o app é de alta constância.
            </Text>
            <Text className="font-fraunces text-sm text-gentil-muted">
              - Próxima evolução: metas semanais e gráfico de consistência diária.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
