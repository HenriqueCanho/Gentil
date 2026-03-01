import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Flame, Heart, LogOut, UserCircle2 } from 'lucide-react-native';

import { listFavorites } from '../lib/favorites';
import { loadNotificationPrefs } from '../lib/notifications';
import { loadUserStreak } from '../lib/streaks';
import { supabase } from '../lib/supabase';
import { COLORS } from '../theme/colors';
import { loadOnboardingResponses } from '../utils/onboarding';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [streak, setStreak] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [notifSummary, setNotifSummary] = useState('0/dia');
  const [onboardingItems, setOnboardingItems] = useState<Array<{ label: string; value: string }>>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [userResult, streakValue, favorites, prefs, onboarding] = await Promise.all([
        supabase.auth.getUser(),
        loadUserStreak(),
        listFavorites(),
        loadNotificationPrefs(),
        loadOnboardingResponses(),
      ]);

      setEmail(userResult.data.user?.email ?? 'Sem e-mail');
      setStreak(streakValue);
      setFavoritesCount(favorites.length);
      setNotifSummary(
        prefs ? `${prefs.per_day}/dia • ${prefs.start_time} - ${prefs.end_time}` : 'Não configurado',
      );

      setOnboardingItems([
        { label: 'Nome', value: onboarding.name ?? '—' },
        { label: 'Signo', value: onboarding.signo ?? '—' },
        { label: 'Meta inicial', value: onboarding.startGoal ?? '—' },
        { label: 'Sentimento atual', value: onboarding.recentFeeling ?? '—' },
        { label: 'Categoria principal', value: onboarding.categories?.[0] ?? '—' },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
        <Text className="font-fraunces text-sm text-gentil-muted">Sua conta</Text>
        <Text className="mt-1 font-fraunces-bold text-3xl text-white">Profile</Text>

        <View className="mt-6 rounded-2xl border border-gentil-border bg-gentil-card p-5">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-accent/20">
              <UserCircle2 color={COLORS.accent} size={22} />
            </View>
            <View className="flex-1">
              <Text className="font-fraunces-semi text-base text-white">Conta logada</Text>
              <Text className="font-fraunces text-xs text-gentil-muted">{email}</Text>
            </View>
          </View>
        </View>

        <View className="mt-4 gap-2.5">
          <View className="rounded-2xl border border-gentil-border bg-gentil-input p-4">
            <View className="flex-row items-center gap-2">
              <Flame color={COLORS.accent} size={18} />
              <Text className="font-fraunces-semi text-base text-white">Streak</Text>
            </View>
            <Text className="mt-2 font-fraunces-bold text-2xl text-accent">{streak} dias</Text>
          </View>

          <View className="rounded-2xl border border-gentil-border bg-gentil-input p-4">
            <View className="flex-row items-center gap-2">
              <Bell color={COLORS.accent} size={18} />
              <Text className="font-fraunces-semi text-base text-white">Notificações</Text>
            </View>
            <Text className="mt-2 font-fraunces text-sm text-gentil-muted">{notifSummary}</Text>
          </View>

          <View className="rounded-2xl border border-gentil-border bg-gentil-input p-4">
            <View className="flex-row items-center gap-2">
              <Heart color={COLORS.accent} size={18} />
              <Text className="font-fraunces-semi text-base text-white">Favoritas</Text>
            </View>
            <Text className="mt-2 font-fraunces text-sm text-gentil-muted">
              {favoritesCount} frases salvas
            </Text>
          </View>
        </View>

        <View className="mt-4 rounded-2xl border border-gentil-border bg-gentil-input p-4">
          <Text className="font-fraunces-semi text-base text-white">Resumo do onboarding</Text>
          <View className="mt-3 gap-2">
            {onboardingItems.map((item) => (
              <View key={item.label} className="flex-row items-center justify-between">
                <Text className="font-fraunces text-xs text-gentil-muted">{item.label}</Text>
                <Text className="font-fraunces-semi text-sm text-white">{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-4 rounded-2xl border border-gentil-border bg-gentil-input p-4">
          <Text className="font-fraunces-semi text-base text-white">Próximas funcionalidades</Text>
          <View className="mt-2 gap-1.5">
            <Text className="font-fraunces text-sm text-gentil-muted">- Meta mensal com progresso.</Text>
            <Text className="font-fraunces text-sm text-gentil-muted">- Exportar histórico pessoal.</Text>
            <Text className="font-fraunces text-sm text-gentil-muted">- Badge por sequência e consistência.</Text>
          </View>
        </View>

        <Pressable
          onPress={() => supabase.auth.signOut()}
          className="mt-5 flex-row items-center justify-center gap-2 rounded-2xl border border-red-400 bg-red-500/10 py-3.5"
        >
          <LogOut color="#f87171" size={18} />
          <Text className="font-fraunces-semi text-red-400">Sair da conta</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
