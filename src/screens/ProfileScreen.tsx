import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Bell, Flame, Heart, LogOut, UserCircle2, BookOpen, Repeat, CheckCircle } from 'lucide-react-native';

import { listFavorites } from '../lib/favorites';
import { listReposts, type RepostedAffirmation } from '../lib/reposts';
import { loadNotificationPrefs } from '../lib/notifications';
import { loadUserStreak } from '../lib/streaks';
import { getDailyReadIds } from '../lib/affirmations';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { loadOnboardingResponses } from '../utils/onboarding';
import { loadAppPreferences, saveAppPreferences } from '../lib/appPreferences';
import SelectField from '../components/SelectField';

const READING_GOAL_OPTIONS = ['3', '5', '10', '15', '20', '30'];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [streak, setStreak] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [readsToday, setReadsToday] = useState(0);
  const [notifSummary, setNotifSummary] = useState('0/dia');
  const [readingGoal, setReadingGoal] = useState('5');
  const [reposts, setReposts] = useState<RepostedAffirmation[]>([]);
  const [onboardingItems, setOnboardingItems] = useState<Array<{ label: string; value: string }>>([]);
  const bottomPadding = 24 + insets.bottom + 54;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [userResult, streakValue, favorites, prefs, onboarding, appPrefs, repostsData, readIds] = await Promise.all([
        supabase.auth.getUser(),
        loadUserStreak(),
        listFavorites(),
        loadNotificationPrefs(),
        loadOnboardingResponses(),
        loadAppPreferences(),
        listReposts(),
        getDailyReadIds(),
      ]);

      setEmail(userResult.data.user?.email ?? 'Sem e-mail');
      setStreak(streakValue);
      setFavoritesCount(favorites.length);
      setReadsToday(readIds.size);
      setNotifSummary(
        prefs ? `${prefs.per_day}/dia • ${prefs.start_time} - ${prefs.end_time}` : 'Não configurado',
      );
      setReadingGoal(String(appPrefs.dailyReadingGoal));
      setReposts(repostsData);

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
        contentContainerStyle={{ padding: 24, paddingBottom: bottomPadding }}
      >
        <Text className="font-fraunces text-sm" style={{ color: colors.muted }}>Sua conta</Text>
        <Text className="mt-1 font-fraunces-bold text-3xl" style={{ color: colors.text }}>Profile</Text>

        <View
          className="mt-6 rounded-2xl border p-5"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
        >
          <View className="flex-row items-center gap-3">
            <View
              className="h-11 w-11 items-center justify-center rounded-xl"
              style={{ backgroundColor: colors.accentDim }}
            >
              <UserCircle2 color={colors.accent} size={22} />
            </View>
            <View className="flex-1">
              <Text className="font-fraunces-semi text-base" style={{ color: colors.text }}>Conta logada</Text>
              <Text className="font-fraunces text-xs" style={{ color: colors.muted }}>{email}</Text>
            </View>
          </View>
        </View>

        <View className="mt-4 gap-2.5">
          <View
            className="rounded-2xl border p-4"
            style={{
              backgroundColor: colors.inputBg,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center gap-2">
              <Flame color={colors.accent} size={18} />
              <Text className="font-fraunces-semi text-base" style={{ color: colors.text }}>Streak</Text>
            </View>
            <Text className="mt-2 font-fraunces-bold text-2xl" style={{ color: colors.accent }}>{streak} dias</Text>
          </View>

          <View
            className="rounded-2xl border p-4"
            style={{
              backgroundColor: colors.inputBg,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center gap-2">
              <CheckCircle color={colors.accent} size={18} />
              <Text className="font-fraunces-semi text-base" style={{ color: colors.text }}>Leituras hoje</Text>
            </View>
            <Text className="mt-2 font-fraunces-bold text-2xl" style={{ color: colors.accent }}>{readsToday}</Text>
          </View>

          <View
            className="rounded-2xl border p-4"
            style={{
              backgroundColor: colors.inputBg,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center gap-2">
              <Bell color={colors.accent} size={18} />
              <Text className="font-fraunces-semi text-base" style={{ color: colors.text }}>Notificações</Text>
            </View>
            <Text className="mt-2 font-fraunces text-sm" style={{ color: colors.muted }}>{notifSummary}</Text>
          </View>

          <View
            className="rounded-2xl border p-4"
            style={{
              backgroundColor: colors.inputBg,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center gap-2">
              <Heart color={colors.accent} size={18} />
              <Text className="font-fraunces-semi text-base" style={{ color: colors.text }}>Favoritas</Text>
            </View>
            <Text className="mt-2 font-fraunces text-sm" style={{ color: colors.muted }}>
              {favoritesCount} frases salvas
            </Text>
          </View>

          <View
            className="rounded-2xl border p-4"
            style={{
              backgroundColor: colors.inputBg,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center gap-2 mb-2">
              <BookOpen color={colors.accent} size={18} />
              <Text className="font-fraunces-semi text-base" style={{ color: colors.text }}>Meta de leitura</Text>
            </View>
            <SelectField
              value={readingGoal}
              onChange={async (val) => {
                setReadingGoal(val);
                await saveAppPreferences({ dailyReadingGoal: Number(val) });
              }}
              options={READING_GOAL_OPTIONS}
              placeholder="Escolha sua meta"
            />
          </View>
        </View>

        {reposts.length > 0 && (
          <Pressable
            onPress={() => navigation.navigate('Reposts' as never)}
            className="mt-4 rounded-2xl border p-4"
            style={{
              backgroundColor: colors.inputBg,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center gap-2 mb-3">
              <Repeat color={colors.accent} size={18} />
              <Text className="font-fraunces-semi text-base" style={{ color: colors.text }}>Meus Reposts</Text>
            </View>
            <View className="gap-3">
              {reposts.slice(0, 3).map((item) => (
                <View key={item.id} className="border-b pb-3 last:border-0 last:pb-0" style={{ borderColor: colors.border }}>
                  <Text className="font-fraunces text-sm leading-5" style={{ color: colors.text }}>
                    "{item.texto}"
                  </Text>
                  <Text className="mt-1 font-fraunces text-xs" style={{ color: colors.muted }}>
                    {new Date(item.created_at).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              ))}
              {reposts.length > 3 && (
                <Text className="font-fraunces-semi text-center text-xs mt-1" style={{ color: colors.accent }}>
                  Ver todos ({reposts.length})
                </Text>
              )}
            </View>
          </Pressable>
        )}

        <View
          className="mt-4 rounded-2xl border p-4"
          style={{
            backgroundColor: colors.inputBg,
            borderColor: colors.border,
          }}
        >
          <Text className="font-fraunces-semi text-base" style={{ color: colors.text }}>Resumo do onboarding</Text>
          <View className="mt-3 gap-2">
            {onboardingItems.map((item) => (
              <View key={item.label} className="flex-row items-center justify-between">
                <Text className="font-fraunces text-xs" style={{ color: colors.muted }}>{item.label}</Text>
                <Text className="font-fraunces-semi text-sm" style={{ color: colors.text }}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View
          className="mt-4 rounded-2xl border p-4"
          style={{
            backgroundColor: colors.inputBg,
            borderColor: colors.border,
          }}
        >
          <Text className="font-fraunces-semi text-base" style={{ color: colors.text }}>Próximas funcionalidades</Text>
          <View className="mt-2 gap-1.5">
            <Text className="font-fraunces text-sm" style={{ color: colors.muted }}>- Meta mensal com progresso.</Text>
            <Text className="font-fraunces text-sm" style={{ color: colors.muted }}>- Exportar histórico pessoal.</Text>
            <Text className="font-fraunces text-sm" style={{ color: colors.muted }}>- Badge por sequência e consistência.</Text>
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
