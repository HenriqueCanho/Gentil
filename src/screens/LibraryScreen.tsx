import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { listAffirmationsByCategory, type Affirmation } from '../lib/affirmations';
import { COLORS } from '../theme/colors';

const CATEGORIES = [
  'Ansiedade',
  'Sonhar grande',
  'Manhã',
  'Amor próprio',
  'Pensar demais',
  'Romance',
  'Atração',
  'Diálogo interno',
  'Positividade',
  'Criança interior',
  'Propósito',
  'autoconfianca',
];

export default function LibraryScreen() {
  const [selected, setSelected] = useState(CATEGORIES[0]);
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (cat: string) => {
    setLoading(true);
    try {
      const data = await listAffirmationsByCategory(cat);
      setAffirmations(data);
    } catch {
      setAffirmations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(selected);
  }, [selected, load]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* Category pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 16, gap: 8 }}
        style={{ flexGrow: 0 }}
      >
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setSelected(cat)}
            style={{
              backgroundColor: selected === cat ? COLORS.accent : COLORS.chip,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <Text
              style={{
                fontFamily: 'Fraunces_600SemiBold',
                fontSize: 13,
                color: selected === cat ? COLORS.bg : COLORS.text,
              }}
            >
              {cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Affirmations list */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={COLORS.accent} size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 24, gap: 12, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {affirmations.length === 0 ? (
            <View
              style={{
                backgroundColor: COLORS.card,
                borderRadius: 16,
                padding: 32,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: 'Fraunces_400Regular',
                  fontSize: 15,
                  color: COLORS.muted,
                  textAlign: 'center',
                }}
              >
                Nenhuma afirmação nesta categoria ainda.
              </Text>
            </View>
          ) : (
            affirmations.map((item) => (
              <View
                key={item.id}
                style={{
                  backgroundColor: COLORS.card,
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Fraunces_400Regular',
                    fontSize: 16,
                    color: COLORS.text,
                    lineHeight: 24,
                  }}
                >
                  {item.texto}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
