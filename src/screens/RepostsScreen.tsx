import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Globe, Lock, Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { listReposts, removeRepost, togglePublicStatus, type RepostedAffirmation } from '../lib/reposts';
import { useTheme } from '../context/ThemeContext';
import ConfirmationModal from '../components/ConfirmationModal';

export default function RepostsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [reposts, setReposts] = useState<RepostedAffirmation[]>([]);
  const [repostToDelete, setRepostToDelete] = useState<RepostedAffirmation | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listReposts();
      setReposts(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleTogglePublic = async (item: RepostedAffirmation) => {
    const newValue = !item.is_public;
    // Optimistic update
    setReposts((prev) =>
      prev.map((r) => (r.id === item.id ? { ...r, is_public: newValue } : r))
    );
    await togglePublicStatus(item.id, newValue);
  };

  const handleRemove = (item: RepostedAffirmation) => {
    setRepostToDelete(item);
  };

  const confirmDelete = async () => {
    if (!repostToDelete) return;

    // Optimistic update
    setReposts((prev) => prev.filter((r) => r.id !== repostToDelete.id));
    
    // Close modal immediately
    setRepostToDelete(null);

    await removeRepost(repostToDelete.affirmation_id);
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      className="flex-1"
      style={{ backgroundColor: colors.bg }}
    >
      <View className="flex-row items-center gap-4 px-6 pt-4 pb-2">
        <Pressable
          onPress={() => navigation.goBack()}
          className="h-10 w-10 items-center justify-center"
        >
          <ChevronLeft color={colors.text} size={20} />
        </Pressable>
        <Text className="font-fraunces-bold text-2xl absolute right-0 left-0 text-center" style={{ color: colors.text }}>
          Meus Reposts
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : reposts.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center font-fraunces text-lg" style={{ color: colors.muted }}>
            Você ainda não repostou nenhuma frase.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 24, gap: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {reposts.map((item) => (
            <View
              key={item.id}
              className="rounded-2xl border p-5"
              style={{
                backgroundColor: colors.bg,
                borderColor: colors.border,
              }}
            >
              <Text
                className="font-fraunces-bold text-lg leading-6"
                style={{ color: colors.text }}
              >
                "{item.texto}"
              </Text>
              
              <View className="mt-4 flex-row items-center justify-between border-t pt-4" style={{ borderColor: colors.border }}>
                <Text className="font-fraunces text-xs" style={{ color: colors.muted }}>
                  {new Date(item.created_at).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>

                <View className="flex-row items-center gap-3">
                  <Pressable
                    onPress={() => handleTogglePublic(item)}
                    className="flex-row items-center gap-1.5 rounded-full border px-3 py-1.5"
                    style={{ backgroundColor: colors.bg, borderColor: item.is_public ? colors.accent : colors.border }}
                  >
                    {item.is_public ? (
                      <Globe size={14} color={colors.accent} />
                    ) : (
                      <Lock size={14} color={colors.muted} />
                    )}
                    <Text
                      className="font-fraunces-semi text-xs"
                      style={{ color: item.is_public ? colors.accent : colors.muted }}
                    >
                      {item.is_public ? 'Público' : 'Privado'}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleRemove(item)}
                    className="h-8 w-8 items-center justify-center rounded-full border"
                    style={{ backgroundColor: colors.bg, borderColor: colors.error }}
                  >
                    <Trash2 size={16} color={colors.error} />
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <ConfirmationModal
        visible={!!repostToDelete}
        title="Remover repost"
        message="Tem certeza que deseja remover este repost?"
        confirmText="Remover"
        onConfirm={confirmDelete}
        onCancel={() => setRepostToDelete(null)}
      />
    </SafeAreaView>
  );
}
