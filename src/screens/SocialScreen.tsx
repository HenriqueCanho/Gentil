import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Users } from 'lucide-react-native';

import { useTheme } from '../context/ThemeContext';

type SocialUser = {
  id: string;
  name: string;
  mood: string;
  streak: number;
  following: boolean;
};

const INITIAL_USERS: SocialUser[] = [
  { id: '1', name: 'Ana', mood: 'Animada', streak: 12, following: true },
  { id: '2', name: 'Rafa', mood: 'Focado', streak: 7, following: false },
  { id: '3', name: 'Luiza', mood: 'Tranquila', streak: 24, following: false },
  { id: '4', name: 'Caio', mood: 'Motivado', streak: 3, following: true },
];

export default function SocialScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [people, setPeople] = useState<SocialUser[]>(INITIAL_USERS);

  const filteredPeople = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return people;
    return people.filter((p) => p.name.toLowerCase().includes(term));
  }, [query, people]);
  const bottomPadding = 24 + insets.bottom + 54;

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
        <Text className="font-fraunces text-sm" style={{ color: colors.muted }}>
          Comunidade
        </Text>
        <Text className="mt-1 font-fraunces-bold text-3xl" style={{ color: colors.text }}>
          Social
        </Text>

        <View
          className="mt-6 flex-row items-center rounded-2xl border px-4"
          style={{
            borderColor: colors.border,
            backgroundColor: colors.inputBg,
          }}
        >
          <Search color={colors.muted} size={18} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar pessoas"
            placeholderTextColor={colors.muted}
            className="flex-1 px-3 py-3.5 font-fraunces"
            style={{ color: colors.text }}
          />
        </View>

        <View
          className="mt-4 rounded-2xl border p-4"
          style={{
            borderColor: colors.border,
            backgroundColor: colors.inputBg,
          }}
        >
          <View className="flex-row items-center gap-2">
            <Users color={colors.accent} size={18} />
            <Text className="font-fraunces-semi text-base" style={{ color: colors.text }}>
              Status da rede
            </Text>
          </View>
          <Text className="mt-2 font-fraunces text-sm" style={{ color: colors.muted }}>
            Esta tela já está pronta para receber feed, comentários e presença em tempo real.
          </Text>
        </View>

        <View className="mt-4 gap-2.5">
          {filteredPeople.map((person) => (
            <View
              key={person.id}
              className="rounded-2xl border p-4"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.card,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="font-fraunces-semi text-base" style={{ color: colors.text }}>
                    {person.name}
                  </Text>
                  <Text className="mt-0.5 font-fraunces text-xs" style={{ color: colors.muted }}>
                    Humor: {person.mood} • 🔥 {person.streak} dias
                  </Text>
                </View>
                <Pressable
                  onPress={() =>
                    setPeople((prev) =>
                      prev.map((p) =>
                        p.id === person.id ? { ...p, following: !p.following } : p,
                      ),
                    )
                  }
                  className="rounded-xl px-3 py-2"
                  style={{
                    backgroundColor: person.following ? colors.chip : colors.accent,
                  }}
                >
                  <Text
                    className="font-fraunces-semi text-xs"
                    style={{
                      color: person.following ? colors.text : colors.bg,
                    }}
                  >
                    {person.following ? 'Seguindo' : 'Seguir'}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

