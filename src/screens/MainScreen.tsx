import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
import { Heart, RefreshCw, Share2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  listAffirmations,
  recordAffirmationRead,
  type Affirmation,
} from '../lib/affirmations';
import { loadAppPreferences, saveAppPreferences } from '../lib/appPreferences';
import { isFavorited, toggleFavorite } from '../lib/favorites';
import { loadUserStreak, incrementStreak } from '../lib/streaks';
import { COLORS } from '../theme/colors';

type AnimationMode = 'fade' | 'slide' | 'scale';

const MODES: Array<{ id: AnimationMode; label: string }> = [
  { id: 'fade', label: 'Fade' },
  { id: 'slide', label: 'Slide' },
  { id: 'scale', label: 'Scale' },
];

export default function MainScreen() {
  const [affirmation, setAffirmation] = useState<Affirmation | null>(null);
  const [allAffirmations, setAllAffirmations] = useState<Affirmation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [animationMode, setAnimationMode] = useState<AnimationMode>('fade');
  const [showCategoryTags, setShowCategoryTags] = useState(true);
  const cardAnim = useRef(new Animated.Value(1)).current;

  const playTransition = (mode: AnimationMode) => {
    if (mode === 'slide') {
      cardAnim.setValue(16);
      Animated.spring(cardAnim, {
        toValue: 0,
        damping: 16,
        stiffness: 220,
        useNativeDriver: true,
      }).start();
      return;
    }

    if (mode === 'scale') {
      cardAnim.setValue(0.95);
      Animated.spring(cardAnim, {
        toValue: 1,
        damping: 16,
        stiffness: 220,
        useNativeDriver: true,
      }).start();
      return;
    }

    cardAnim.setValue(0);
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [items, streakData, prefs] = await Promise.all([
        listAffirmations(50),
        loadUserStreak(),
        loadAppPreferences(),
      ]);

      setAllAffirmations(items);
      setStreak(streakData);
      setAnimationMode(prefs.mainAnimationMode);
      setShowCategoryTags(prefs.showCategoryTags);

      if (items.length > 0) {
        const idx = new Date().getDate() % items.length;
        const first = items[idx];
        setCurrentIndex(idx);
        setAffirmation(first);
        setFavorited(await isFavorited(first.id));
        await recordAffirmationRead(first.id);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    incrementStreak().catch(() => {});
  }, [load]);

  const setCurrentAffirmation = async (idx: number) => {
    const selected = allAffirmations[idx];
    if (!selected) return;
    setCurrentIndex(idx);
    setAffirmation(selected);
    setFavorited(await isFavorited(selected.id));
    await recordAffirmationRead(selected.id);
    playTransition(animationMode);
  };

  const handleNext = async () => {
    if (allAffirmations.length === 0) return;
    const nextIdx = (currentIndex + 1) % allAffirmations.length;
    await setCurrentAffirmation(nextIdx);
  };

  const handleFavorite = async () => {
    if (!affirmation) return;
    const next = await toggleFavorite(affirmation.id);
    setFavorited(next);
  };

  const handleShare = async () => {
    if (!affirmation) return;
    await Share.share({ message: affirmation.texto });
  };

  const handleModeChange = async (mode: AnimationMode) => {
    setAnimationMode(mode);
    await saveAppPreferences({ mainAnimationMode: mode });
  };

  const styleForAnimation = () => {
    if (animationMode === 'slide') {
      return { transform: [{ translateY: cardAnim }] };
    }

    if (animationMode === 'scale') {
      return { transform: [{ scale: cardAnim }] };
    }

    return { opacity: cardAnim };
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-gentil-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingBottom: 0 }}
      >
        <Text className="font-fraunces text-sm text-gentil-muted">Seu espaço principal</Text>
        <Text className="mt-1 font-fraunces-bold text-3xl text-white">Affirmações</Text>

        <View className="mt-3 flex-row items-center gap-2">
          <Text className="text-base">🔥</Text>
          <Text className="font-fraunces-semi text-sm text-accent">
            {streak} {streak === 1 ? 'dia' : 'dias'} de sequência
          </Text>
        </View>

        <View className="mt-6 rounded-2xl border border-gentil-border bg-gentil-input p-3">
          <Text className="mb-2 font-fraunces text-xs text-gentil-muted">
            Animação ao trocar afirmação
          </Text>
          <View className="flex-row gap-2">
            {MODES.map((mode) => {
              const active = mode.id === animationMode;
              return (
                <Pressable
                  key={mode.id}
                  onPress={() => handleModeChange(mode.id)}
                  className={`rounded-xl px-3 py-2 ${
                    active ? 'bg-accent' : 'bg-gentil-chip'
                  }`}
                >
                  <Text
                    className={`font-fraunces-semi text-xs ${
                      active ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {mode.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="mt-4 flex-row items-center justify-between rounded-2xl border border-gentil-border bg-gentil-input px-4 py-3">
          <Text className="font-fraunces text-sm text-white">Mostrar categoria na frase</Text>
          <Pressable
            onPress={async () => {
              const next = !showCategoryTags;
              setShowCategoryTags(next);
              await saveAppPreferences({ showCategoryTags: next });
            }}
            className={`rounded-full px-3 py-1 ${showCategoryTags ? 'bg-accent' : 'bg-gentil-chip'}`}
          >
            <Text className={`font-fraunces-semi text-xs ${showCategoryTags ? 'text-slate-900' : 'text-white'}`}>
              {showCategoryTags ? 'ON' : 'OFF'}
            </Text>
          </Pressable>
        </View>

        <View className="mt-6">
          {loading ? (
            <View className="min-h-[260px] items-center justify-center rounded-2xl border border-gentil-border bg-gentil-card">
              <ActivityIndicator size="large" color={COLORS.accent} />
            </View>
          ) : affirmation ? (
            <Animated.View
              style={styleForAnimation()}
              className="min-h-[260px] items-center justify-center rounded-2xl border border-gentil-border bg-gentil-card p-8"
            >
              <Text className="text-center font-fraunces-bold text-[24px] leading-9 text-white">
                {affirmation.texto}
              </Text>
              {showCategoryTags && (
                <View className="mt-5 rounded-md bg-accent/20 px-3 py-1">
                  <Text className="font-fraunces text-xs text-accent">#{affirmation.categoria}</Text>
                </View>
              )}
            </Animated.View>
          ) : (
            <View className="min-h-[260px] items-center justify-center rounded-2xl border border-gentil-border bg-gentil-card p-8">
              <Text className="text-center font-fraunces text-sm text-gentil-muted">
                Nenhuma afirmação disponível.
              </Text>
            </View>
          )}
        </View>

        <View className="mt-5 flex-row justify-center gap-6">
          <Pressable onPress={handleFavorite} className="items-center gap-1">
            <Heart
              color={favorited ? COLORS.accent : COLORS.muted}
              fill={favorited ? COLORS.accent : 'transparent'}
              size={26}
            />
            <Text className="font-fraunces text-xs text-gentil-muted">Favoritar</Text>
          </Pressable>
          <Pressable onPress={handleNext} className="items-center gap-1">
            <RefreshCw color={COLORS.muted} size={26} />
            <Text className="font-fraunces text-xs text-gentil-muted">Próxima</Text>
          </Pressable>
          <Pressable onPress={handleShare} className="items-center gap-1">
            <Share2 color={COLORS.muted} size={26} />
            <Text className="font-fraunces text-xs text-gentil-muted">Compartilhar</Text>
          </Pressable>
        </View>

        {allAffirmations.length > 1 && (
          <View className="mt-8">
            <Text className="mb-3 font-fraunces-bold text-lg text-white">Lista completa</Text>
            <View className="gap-2.5">
              {allAffirmations.slice(0, 12).map((item, idx) => (
                <Pressable
                  key={item.id}
                  onPress={() => setCurrentAffirmation(idx)}
                  className={`rounded-xl border p-4 ${
                    idx === currentIndex
                      ? 'border-accent/40 bg-gentil-card'
                      : 'border-gentil-border bg-gentil-input'
                  }`}
                >
                  <Text numberOfLines={2} className="font-fraunces text-sm leading-5 text-white">
                    {item.texto}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
