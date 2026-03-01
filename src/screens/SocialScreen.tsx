import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Users } from 'lucide-react-native';

import { COLORS } from '../theme/colors';

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
  const [query, setQuery] = useState('');
  const [people, setPeople] = useState<SocialUser[]>(INITIAL_USERS);

  const filteredPeople = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return people;
    return people.filter((p) => p.name.toLowerCase().includes(term));
  }, [query, people]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-gentil-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingBottom: 0 }}
      >
        <Text className="font-fraunces text-sm text-gentil-muted">Comunidade</Text>
        <Text className="mt-1 font-fraunces-bold text-3xl text-white">Social</Text>

        <View className="mt-6 flex-row items-center rounded-2xl border border-gentil-border bg-gentil-input px-4">
          <Search color={COLORS.muted} size={18} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar pessoas"
            placeholderTextColor={COLORS.muted}
            className="flex-1 px-3 py-3.5 font-fraunces text-white"
          />
        </View>

        <View className="mt-4 rounded-2xl border border-gentil-border bg-gentil-input p-4">
          <View className="flex-row items-center gap-2">
            <Users color={COLORS.accent} size={18} />
            <Text className="font-fraunces-semi text-base text-white">Status da rede</Text>
          </View>
          <Text className="mt-2 font-fraunces text-sm text-gentil-muted">
            Esta tela já está pronta para receber feed, comentários e presença em tempo real.
          </Text>
        </View>

        <View className="mt-4 gap-2.5">
          {filteredPeople.map((person) => (
            <View
              key={person.id}
              className="rounded-2xl border border-gentil-border bg-gentil-card p-4"
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="font-fraunces-semi text-base text-white">{person.name}</Text>
                  <Text className="mt-0.5 font-fraunces text-xs text-gentil-muted">
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
                  className={`rounded-xl px-3 py-2 ${
                    person.following ? 'bg-gentil-chip' : 'bg-accent'
                  }`}
                >
                  <Text
                    className={`font-fraunces-semi text-xs ${
                      person.following ? 'text-white' : 'text-slate-900'
                    }`}
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
