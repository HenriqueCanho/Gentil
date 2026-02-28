import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Heart } from 'lucide-react-native';

import { listFavorites, removeFavorite, type FavoriteAffirmation } from '../lib/favorites';
import { COLORS } from '../theme/colors';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<FavoriteAffirmation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listFavorites();
      setFavorites(data);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRemove = async (affirmationId: string) => {
    await removeFavorite(affirmationId);
    setFavorites((prev) => prev.filter((f) => f.affirmation_id !== affirmationId));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={{ padding: 24, paddingBottom: 8 }}>
        <Text
          style={{
            fontFamily: 'Fraunces_700Bold',
            fontSize: 26,
            color: COLORS.text,
          }}
        >
          Favoritos
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={COLORS.accent} size="large" />
        </View>
      ) : favorites.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Heart color={COLORS.muted} size={48} />
          <Text
            style={{
              fontFamily: 'Fraunces_400Regular',
              fontSize: 16,
              color: COLORS.muted,
              textAlign: 'center',
              marginTop: 16,
            }}
          >
            Nenhuma afirmação favoritada ainda. Favorite as que mais te tocam!
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 24, gap: 12, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {favorites.map((fav) => (
            <View
              key={fav.id}
              style={{
                backgroundColor: COLORS.card,
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: COLORS.border,
                flexDirection: 'row',
                gap: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Fraunces_400Regular',
                  fontSize: 15,
                  color: COLORS.text,
                  lineHeight: 22,
                  flex: 1,
                }}
              >
                {fav.texto}
              </Text>
              <Pressable onPress={() => handleRemove(fav.affirmation_id)}>
                <Heart color={COLORS.accent} fill={COLORS.accent} size={22} />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
