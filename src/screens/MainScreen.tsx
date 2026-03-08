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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Flame, Heart, Share2, User, BookOpen, Repeat } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  listAffirmations,
  recordAffirmationRead,
  getDailyReadIds,
  type Affirmation,
} from '../lib/affirmations';
import { loadAppPreferences, saveAppPreferences } from '../lib/appPreferences';
import { isFavorited, toggleFavorite } from '../lib/favorites';
import { isReposted, toggleRepost } from '../lib/reposts';
import { loadUserStreak, incrementStreak } from '../lib/streaks';
import { useTheme } from '../context/ThemeContext';
import ShareModal from '../components/ShareModal';

export default function MainScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [affirmation, setAffirmation] = useState<Affirmation | null>(null);
  const [allAffirmations, setAllAffirmations] = useState<Affirmation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [showCategoryTags, setShowCategoryTags] = useState(true);
  const [readingGoal, setReadingGoal] = useState(5);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [showShareModal, setShowShareModal] = useState(false);
  const cardAnim = useRef(new Animated.Value(1)).current;
  const affirmationRef = useRef<Affirmation | null>(null);

  useEffect(() => {
    affirmationRef.current = affirmation;
  }, [affirmation]);

  const playTransition = () => {
    cardAnim.setValue(0);
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const load = useCallback(async () => {
    try {
      // Don't set loading(true) here to avoid flicker on focus
      const [items, streakData, prefs, ids] = await Promise.all([
        listAffirmations(50),
        loadUserStreak(),
        loadAppPreferences(),
        getDailyReadIds(),
      ]);

      setAllAffirmations(items);
      setStreak(streakData);
      setShowCategoryTags(prefs.showCategoryTags);
      setReadingGoal(prefs.dailyReadingGoal);
      setReadIds(ids);

      if (items.length > 0 && !affirmationRef.current) {
        const idx = new Date().getDate() % items.length;
        const first = items[idx];
        setCurrentIndex(idx);
        setAffirmation(first);
        setFavorited(await isFavorited(first.id));
        setReposted(await isReposted(first.id));
        await recordAffirmationRead(first.id);
        setReadIds((prev) => new Set(prev).add(first.id));
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      incrementStreak().catch(() => { });
    }, [load])
  );

  const setCurrentAffirmation = async (idx: number) => {
    const selected = allAffirmations[idx];
    if (!selected) return;
    setCurrentIndex(idx);
    setAffirmation(selected);
    playTransition();
    
    setFavorited(await isFavorited(selected.id));
    setReposted(await isReposted(selected.id));
    await recordAffirmationRead(selected.id);
    setReadIds((prev) => new Set(prev).add(selected.id));
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

  const handleRepost = async () => {
    if (!affirmation) return;
    const next = await toggleRepost(affirmation.id);
    setReposted(next);
  };

  const handleShare = () => {
    if (!affirmation) return;
    setShowShareModal(true);
  };

  const styleForAnimation = () => ({ opacity: cardAnim });

  // Use View flex-1 instead of SafeAreaView to allow full background coverage
  // Manually handle top/bottom insets for elements
  const topBarTop = insets.top + 16;
  const bottomBarBottom = insets.bottom + 80; // Above tab bar

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: colors.bg }}
    >
      <View
        className="absolute left-0 right-0 items-center z-10"
        style={{ top: topBarTop }}
      >
        <View
          className="flex-row items-center gap-2 rounded-full px-4 py-2"
          style={{ backgroundColor: colors.inputBg }}
        >
          <BookOpen size={16} color={colors.accent} fill={colors.accent} />
          <Text className="font-fraunces-semi text-xs" style={{ color: colors.text }}>
            {readIds.size}/{readingGoal}
          </Text>
          <View className="h-1 w-16 rounded-full bg-gray-200 overflow-hidden ml-2">
            <View
              className="h-full"
              style={{
                backgroundColor: colors.accent,
                width: `${Math.min((readIds.size / readingGoal) * 100, 100)}%`,
              }}
            />
          </View>
        </View>
      </View>

      {/* Main Content */}
      <Pressable
        onPress={handleNext}
        className="flex-1 items-center justify-center px-8"
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.accent} />
        ) : affirmation ? (
          <Animated.View style={[styleForAnimation(), { alignItems: 'center' }]}>
            <Text
              className="text-center font-fraunces-bold text-[32px] leading-10"
              style={{ color: colors.text }}
            >
              {affirmation.texto}
            </Text>
            {showCategoryTags && (
              <View
                className="mt-6 rounded-full px-4 py-1.5"
                style={{ backgroundColor: colors.inputBg }}
              >
                <Text className="font-fraunces text-xs uppercase tracking-widest" style={{ color: colors.accent }}>
                  {affirmation.categoria}
                </Text>
              </View>
            )}
          </Animated.View>
        ) : (
          <Text className="text-center font-fraunces text-lg" style={{ color: colors.muted }}>
            Nenhuma afirmação disponível.
          </Text>
        )}
      </Pressable>

      {/* Bottom Actions Floating - Vertical on Right */}
      <View
        className="absolute right-6 flex-col items-center gap-6"
        style={{ bottom: bottomBarBottom }}
      >
        <Pressable
          onPress={handleFavorite}
          className="items-center justify-center"
        >
          <Heart
            color={favorited ? colors.accent : colors.text}
            fill={favorited ? colors.accent : 'transparent'}
            size={32}
          />
        </Pressable>

        <Pressable
          onPress={handleRepost}
          className="items-center justify-center"
        >
          <Repeat
            color={reposted ? colors.accent : colors.text}
            size={32}
          />
        </Pressable>

        <Pressable
          onPress={handleShare}
          className="items-center justify-center"
        >
          <Share2 color={colors.text} size={28} />
        </Pressable>
      </View>

      {affirmation && (
        <ShareModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          affirmation={affirmation}
        />
      )}
    </View>
  );
}
