import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Palette, Sparkles, SwatchBook } from 'lucide-react-native';

import {
  getThemePalette,
  loadAppPreferences,
  saveAppPreferences,
  type AppThemeMode,
  type MainAnimationMode,
} from '../lib/appPreferences';

const THEMES: Array<{ id: AppThemeMode; name: string }> = [
  { id: 'gentil', name: 'Gentil (Dourado)' },
  { id: 'sunset', name: 'Sunset (Laranja)' },
  { id: 'ocean', name: 'Ocean (Azul)' },
];

const ANIMATIONS: Array<{ id: MainAnimationMode; name: string; description: string }> = [
  { id: 'fade', name: 'Fade', description: 'Troca suave com opacidade.' },
  { id: 'slide', name: 'Slide', description: 'Frase entra deslizando.' },
  { id: 'scale', name: 'Scale', description: 'Leve zoom ao trocar frase.' },
];

export default function ThemeScreen() {
  const [themeMode, setThemeMode] = useState<AppThemeMode>('gentil');
  const [animationMode, setAnimationMode] = useState<MainAnimationMode>('fade');
  const [showCategoryTags, setShowCategoryTags] = useState(true);

  useEffect(() => {
    loadAppPreferences().then((prefs) => {
      setThemeMode(prefs.themeMode);
      setAnimationMode(prefs.mainAnimationMode);
      setShowCategoryTags(prefs.showCategoryTags);
    });
  }, []);

  const palette = getThemePalette(themeMode);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-gentil-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingBottom: 0 }}
      >
        <Text className="font-fraunces text-sm text-gentil-muted">Personalização</Text>
        <Text className="mt-1 font-fraunces-bold text-3xl text-white">Theme</Text>

        <View className="mt-6 rounded-2xl border border-gentil-border bg-gentil-input p-5">
          <View className="mb-3 flex-row items-center gap-2">
            <Palette color={palette.accent} size={18} />
            <Text className="font-fraunces-semi text-base text-white">Paleta de cores</Text>
          </View>
          <View className="gap-2">
            {THEMES.map((item) => {
              const active = item.id === themeMode;
              return (
                <Pressable
                  key={item.id}
                  onPress={async () => {
                    setThemeMode(item.id);
                    await saveAppPreferences({ themeMode: item.id });
                  }}
                  className={`rounded-xl border px-4 py-3 ${
                    active ? 'border-accent bg-accent/20' : 'border-gentil-border bg-gentil-bg'
                  }`}
                >
                  <Text className={`font-fraunces-semi ${active ? 'text-accent' : 'text-white'}`}>
                    {item.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="mt-4 rounded-2xl border border-gentil-border bg-gentil-input p-5">
          <View className="mb-3 flex-row items-center gap-2">
            <Sparkles color={palette.accent} size={18} />
            <Text className="font-fraunces-semi text-base text-white">Animação da Main</Text>
          </View>
          <View className="gap-2">
            {ANIMATIONS.map((item) => {
              const active = item.id === animationMode;
              return (
                <Pressable
                  key={item.id}
                  onPress={async () => {
                    setAnimationMode(item.id);
                    await saveAppPreferences({ mainAnimationMode: item.id });
                  }}
                  className={`rounded-xl border px-4 py-3 ${
                    active ? 'border-accent bg-accent/20' : 'border-gentil-border bg-gentil-bg'
                  }`}
                >
                  <Text className={`font-fraunces-semi ${active ? 'text-accent' : 'text-white'}`}>
                    {item.name}
                  </Text>
                  <Text className="mt-1 font-fraunces text-xs text-gentil-muted">{item.description}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="mt-4 rounded-2xl border border-gentil-border bg-gentil-input p-5">
          <View className="mb-3 flex-row items-center gap-2">
            <SwatchBook color={palette.accent} size={18} />
            <Text className="font-fraunces-semi text-base text-white">Outras preferências</Text>
          </View>
          <View className="flex-row items-center justify-between rounded-xl border border-gentil-border bg-gentil-bg px-4 py-3">
            <Text className="font-fraunces text-sm text-white">Mostrar categoria nas frases</Text>
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
        </View>

        <View className="mt-4 rounded-2xl border border-gentil-border p-5" style={{ backgroundColor: palette.surface }}>
          <Text className="font-fraunces-semi text-base text-white">Preview</Text>
          <Text className="mt-2 font-fraunces text-sm leading-6 text-gentil-muted">
            Esta prévia mostra o acento escolhido para elementos destacados do app. As mudanças já são
            salvas e usadas nas telas configuráveis.
          </Text>
          <View className="mt-4 self-start rounded-lg px-4 py-2" style={{ backgroundColor: palette.accentSoft }}>
            <Text className="font-fraunces-semi text-sm" style={{ color: palette.accent }}>
              Cor ativa selecionada
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
