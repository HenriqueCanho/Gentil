import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, BookMarked, ChartColumn, Flame, Heart, List, Target, Timer, Trophy, Users } from 'lucide-react-native';

import { listAffirmations } from '../lib/affirmations';
import { listFavorites } from '../lib/favorites';
import { loadNotificationPrefs } from '../lib/notifications';
import { getProfile } from '../lib/profiles';
import { loadUserStreak } from '../lib/streaks';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { loadOnboardingResponses } from '../utils/onboarding';
import StreakVase from '../components/StreakVase';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.43;
const SPACING = 12;

type CardProps = {
  title: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
};

function StatCard({ title, value, hint, icon }: CardProps) {
  const { colors } = useTheme();
  return (
    <View
      className="mr-3 rounded-2xl border p-4"
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
        width: CARD_WIDTH,
      }}
    >
      <View className='flex-row justify-between'>
        <Text className="font-fraunces text-md" style={{ color: colors.text }}>{title}</Text>
        <View className="mb-2 items-end">{icon}</View>
      </View>
      <Text className="mt-1 font-fraunces-bold text-3xl" style={{ color: colors.text }}>{value}</Text>
      <Text className="mt-1 font-fraunces text-base" style={{ color: colors.text }}>{hint}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [perDay, setPerDay] = useState(0);
  const [windowHours, setWindowHours] = useState(0);
  const [onboardingCompletion, setOnboardingCompletion] = useState(0);
  const [daysUsingApp, setDaysUsingApp] = useState(0);
  const [readCount, setReadCount] = useState(0);
  const [totalAffirmations, setTotalAffirmations] = useState(0);
  const [friendsCount, setFriendsCount] = useState(2); // Mocked for now

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
  const bottomPadding = 24 + insets.bottom + 54;

  if (loading) {
    return (
      <SafeAreaView
        edges={['top', 'left', 'right']}
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.bg }}
      >
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      className="flex-1"
      style={{ backgroundColor: colors.bg }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPadding }}
      >
        <View className="px-6 pt-6">
          <Text className="font-fraunces text-sm" style={{ color: colors.muted }}>Seu progresso</Text>
          <Text className="mt-1 font-fraunces-bold text-3xl" style={{ color: colors.text }}>Dashboard</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24 }}
          snapToInterval={CARD_WIDTH + SPACING}
          decelerationRate="fast"
          snapToAlignment="start"
        >
          <StatCard
            title="Sequência atual"
            value={`${streak}`}
            hint={`${streak === 1 ? 'dia' : 'dias'} consecutivos`}
            icon={<Flame color={colors.accent} size={18} />}
          />
          <StatCard
            title="Favoritas"
            value={`${favoritesCount}`}
            hint="frases salvas"
            icon={<Heart color={colors.accent} size={18} />}
          />
          <StatCard
            title="Notificações"
            value={`${perDay}/dia`}
            hint={`${weeklyNotifications} por semana`}
            icon={<Bell color={colors.accent} size={18} />}
          />
          <StatCard
            title="Janela ativa"
            value={`${windowHours}h`}
            hint="de envio diário"
            icon={<Timer color={colors.accent} size={18} />}
          />
          <StatCard
            title="Onboarding"
            value={`${onboardingCompletion}%`}
            hint="dados completos"
            icon={<ChartColumn color={colors.accent} size={18} />}
          />
          <StatCard
            title="Leituras"
            value={`${readCount}`}
            hint="afirmações lidas"
            icon={<BookMarked color={colors.accent} size={18} />}
          />
          <StatCard
            title="Você possui"
            value={`${totalAffirmations}`}
            hint="afirmações listadas"
            icon={<List color={colors.accent} size={18} />}
          />
          <StatCard
            title="Amigos"
            value={`${friendsCount}`}
            hint="conectados"
            icon={<Users color={colors.accent} size={18} />}
          />
          <StatCard
            title="Metas"
            value="3/5"
            hint="concluídas hoje"
            icon={<Target color={colors.accent} size={18} />}
          />
          <StatCard
            title="Conquistas"
            value="12"
            hint="troféus ganhos"
            icon={<Trophy color={colors.accent} size={18} />}
          />
        </ScrollView>

        <View className="mx-6 border rounded-2xl p-6" style={{ borderColor: colors.border }}>
          <View className="w-full items-center flex-row mb-10 justify-between">
            <View>
              <Text className="font-fraunces-semi text-base" style={{ color: colors.text }}>Jardim da Constância</Text>
              <Text className="font-fraunces-semi text-sm" style={{ color: colors.muted }}>ganhe uma flor por dia ou um broche</Text>
            </View>
            <Text className="font-fraunces-semi text-3xl" style={{ color: colors.text }}>{streak} <Flame color={colors.accent} size={20} /></Text>
          </View>
          <View className="w-full h-48 flex items-center justify-center">
            <StreakVase streak={streak} interactive />
          </View>
        </View>

        <View className="mt-6 px-6 gap-4">
          <View
            className="rounded-2xl border p-5"
            style={{ borderColor: colors.border, backgroundColor: colors.bg }}
          >
            <View className="flex-row items-center gap-3 mb-3 flex justify-between">
              <View>
                <Text className="font-fraunces-semi text-base" style={{ color: colors.text }}>
                  Metas Diárias
                </Text>
                <Text className="font-fraunces text-xs" style={{ color: colors.muted }}>
                  mantenha o foco no que importa
                </Text>
              </View>
              <View
                className="p-2 rounded-xl"
                style={{ borderColor: colors.border + '20' }}
              >
                <Target color={colors.accent} size={20} />
              </View>
            </View>
            <View className="gap-2">
              {[
                { label: 'ADICIONAR A LÓGICA POR TRÁS DISSO', done: true },
                { label: 'Praticar gratidão', done: true },
                { label: 'Meditar 10 min', done: false },
              ].map((goal, i) => (
                <View key={i} className="flex-row items-center gap-2">
                  <View
                    className="w-4 h-4 rounded-full border items-center justify-center"
                    style={{ borderColor: goal.done ? colors.accent : colors.border, backgroundColor: goal.done ? colors.accent : 'transparent' }}
                  >
                    {goal.done && <Text className="text-[8px]" style={{ color: colors.bg }}>✓</Text>}
                  </View>
                  <Text className="font-fraunces text-sm" style={{ color: goal.done ? colors.text : colors.muted }}>
                    {goal.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View
            className="rounded-2xl border p-5 mb-4"
            style={{ borderColor: colors.border, backgroundColor: colors.bg }}
          >
            <View className="flex-row items-center gap-3 mb-3 flex justify-between">
              <View>
                <Text className="font-fraunces-semi text-base" style={{ color: colors.text }}>
                  Conquistas Recentes
                </Text>
                <Text className="font-fraunces text-xs" style={{ color: colors.muted }}>
                  suas vitórias no Gentil
                </Text>
              </View>
              <View
                className="p-2 rounded-xl"
              >
                <Trophy color={colors.accent} size={20} />
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-2">
              {[
                { name: 'Primeiros Passos', icon: '🌱' },
                { name: 'Sempre Grato', icon: '🙏' },
                { name: 'Fogo Constante', icon: '🔥' },
              ].map((badge, i) => (
                <View key={i} className="items-center px-4">
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mb-1"
                    style={{ backgroundColor: colors.inputBg }}
                  >
                    <Text className="text-xl">{badge.icon}</Text>
                  </View>
                  <Text className="font-fraunces text-[10px] text-center" style={{ color: colors.text }}>
                    {badge.name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

