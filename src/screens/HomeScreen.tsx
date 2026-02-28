import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
import { Heart, Share2, BookOpen, RefreshCw } from 'lucide-react-native';

import { listAffirmations, type Affirmation } from '../lib/affirmations';
import { toggleFavorite, isFavorited } from '../lib/favorites';
import { loadUserStreak, incrementStreak } from '../lib/streaks';
import { supabase } from '../lib/supabase';
import { COLORS } from '../theme/colors';

export default function HomeScreen() {
  const [affirmation, setAffirmation] = useState<Affirmation | null>(null);
  const [allAffirmations, setAllAffirmations] = useState<Affirmation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [userName, setUserName] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [items, streakData, user] = await Promise.all([
        listAffirmations(20),
        loadUserStreak(),
        supabase.auth.getUser(),
      ]);
      setAllAffirmations(items);
      if (items.length > 0) {
        const idx = new Date().getDate() % items.length;
        setCurrentIndex(idx);
        setAffirmation(items[idx]);
        const fav = await isFavorited(items[idx].id);
        setFavorited(fav);
      }
      setStreak(streakData);
      const email = user.data.user?.email ?? '';
      setUserName(email.split('@')[0] ?? '');
    } catch {
      // silence errors in demo mode
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    incrementStreak().catch(() => {});
  }, [load]);

  const handleNext = async () => {
    if (allAffirmations.length === 0) return;
    const nextIdx = (currentIndex + 1) % allAffirmations.length;
    setCurrentIndex(nextIdx);
    setAffirmation(allAffirmations[nextIdx]);
    const fav = await isFavorited(allAffirmations[nextIdx].id);
    setFavorited(fav);
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

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontFamily: 'Fraunces_400Regular',
              fontSize: 15,
              color: COLORS.muted,
            }}
          >
            {greeting()}{userName ? `, ${userName}` : ''}
          </Text>
          <Text
            style={{
              fontFamily: 'Fraunces_700Bold',
              fontSize: 24,
              color: COLORS.text,
              marginTop: 4,
            }}
          >
            Sua afirmação do dia
          </Text>
          {streak > 0 && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                marginTop: 8,
              }}
            >
              <Text style={{ fontSize: 16 }}>🔥</Text>
              <Text
                style={{
                  fontFamily: 'Fraunces_600SemiBold',
                  fontSize: 14,
                  color: COLORS.accent,
                }}
              >
                {streak} {streak === 1 ? 'dia' : 'dias'} consecutivos
              </Text>
            </View>
          )}
        </View>

        {/* Affirmation Card */}
        {loading ? (
          <View
            style={{
              height: 280,
              backgroundColor: COLORS.card,
              borderRadius: 24,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ActivityIndicator color={COLORS.accent} size="large" />
          </View>
        ) : affirmation ? (
          <View
            style={{
              backgroundColor: COLORS.card,
              borderRadius: 24,
              padding: 32,
              minHeight: 280,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text
              style={{
                fontFamily: 'Fraunces_700Bold',
                fontSize: 22,
                color: COLORS.text,
                textAlign: 'center',
                lineHeight: 32,
              }}
            >
              {affirmation.texto}
            </Text>
            <View
              style={{
                marginTop: 24,
                backgroundColor: COLORS.accentDim,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Fraunces_400Regular',
                  fontSize: 12,
                  color: COLORS.accent,
                }}
              >
                #{affirmation.categoria}
              </Text>
            </View>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: COLORS.card,
              borderRadius: 24,
              padding: 32,
              minHeight: 280,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: 'Fraunces_400Regular',
                fontSize: 16,
                color: COLORS.muted,
                textAlign: 'center',
              }}
            >
              Nenhuma afirmação disponível ainda.
            </Text>
          </View>
        )}

        {/* Action row */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 20,
            marginTop: 20,
          }}
        >
          <Pressable
            onPress={handleFavorite}
            style={{
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Heart
              color={favorited ? COLORS.accent : COLORS.muted}
              fill={favorited ? COLORS.accent : 'transparent'}
              size={28}
            />
            <Text
              style={{
                fontFamily: 'Fraunces_400Regular',
                fontSize: 11,
                color: COLORS.muted,
              }}
            >
              Favoritar
            </Text>
          </Pressable>

          <Pressable
            onPress={handleNext}
            style={{
              alignItems: 'center',
              gap: 4,
            }}
          >
            <RefreshCw color={COLORS.muted} size={28} />
            <Text
              style={{
                fontFamily: 'Fraunces_400Regular',
                fontSize: 11,
                color: COLORS.muted,
              }}
            >
              Próxima
            </Text>
          </Pressable>

          <Pressable
            onPress={handleShare}
            style={{
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Share2 color={COLORS.muted} size={28} />
            <Text
              style={{
                fontFamily: 'Fraunces_400Regular',
                fontSize: 11,
                color: COLORS.muted,
              }}
            >
              Compartilhar
            </Text>
          </Pressable>
        </View>

        {/* Recent affirmations */}
        {allAffirmations.length > 1 && (
          <View style={{ marginTop: 36 }}>
            <Text
              style={{
                fontFamily: 'Fraunces_700Bold',
                fontSize: 18,
                color: COLORS.text,
                marginBottom: 16,
              }}
            >
              Mais afirmações
            </Text>
            <View style={{ gap: 10 }}>
              {allAffirmations.slice(0, 5).map((item, i) => (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    setCurrentIndex(i);
                    setAffirmation(item);
                    isFavorited(item.id).then(setFavorited);
                  }}
                  style={{
                    backgroundColor: i === currentIndex ? COLORS.card : COLORS.inputBg,
                    borderRadius: 14,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: i === currentIndex ? COLORS.accent + '40' : COLORS.border,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Fraunces_400Regular',
                      fontSize: 14,
                      color: COLORS.text,
                      lineHeight: 20,
                    }}
                    numberOfLines={2}
                  >
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
