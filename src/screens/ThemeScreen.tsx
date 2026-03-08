import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Play } from 'lucide-react-native';

import { type AppThemeMode } from '../lib/appPreferences';
import { useTheme } from '../context/ThemeContext';
import PrimaryButton from '../components/PrimaryButton';

type ThemePreset = {
  id: AppThemeMode;
  label: string;
  cardBg: string;
  cardTextColor: string;
  isDynamic?: boolean;
};

const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'gentil',
    label: 'Gentil',
    cardBg: '#0A1A19',
    cardTextColor: '#ffffffff',
  },
  {
    id: 'gentil invertido',
    label: 'Gentil Invertido',
    cardBg: '#ffffffff',
    cardTextColor: '#1A3A34',
  },
  {
    id: 'warm',
    label: 'Ensolarado',
    cardBg: '#FFF8EB',
    cardTextColor: '#1A3A34',
  },
  {
    id: 'light',
    label: 'Claro',
    cardBg: '#F7F0E8',
    cardTextColor: '#2b1e1bff',
  },
  {
    id: 'fada',
    label: 'Fada',
    cardBg: '#e270c3ff',
    cardTextColor: '#FFF5F0',
  },
  {
    id: 'storm',
    label: 'Tempestade',
    cardBg: '#3D3B5C',
    cardTextColor: '#F7F0E8',
  },
];

export default function ThemeScreen() {
  const insets = useSafeAreaInsets();
  const { theme, setTheme, colors } = useTheme();
  const bottomPadding = 40 + insets.bottom + 54;

  const handleSelect = (id: AppThemeMode) => {
    setTheme(id);
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      className="flex-1"
      style={{ backgroundColor: colors.bg }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 24,
          paddingBottom: bottomPadding,
          flexGrow: 1,
        }}
      >
        <Text className="font-fraunces text-sm" style={{ color: colors.muted }}>Seu gosto</Text>
        <Text className="mt-1 font-fraunces-bold text-3xl mb-6" style={{ color: colors.text }}>Tema</Text>

        <Text
          className="font-fraunces-bold text-center text-2xl leading-tight"
          style={{ color: colors.text }}
        >
          Qual tema você gostaria de utilizar?
        </Text>
        <Text
          className="mt-2 font-fraunces text-center"
          style={{ color: colors.muted }}
        >
          Escolha entre os temas pré-definidos.
        </Text>

        <View className="mt-8 flex-row flex-wrap justify-between gap-4">
          {THEME_PRESETS.map((preset) => {
            const selected = preset.id === theme;
            return (
              <Pressable
                key={preset.id}
                onPress={() => handleSelect(preset.id)}
                className="w-[47%] overflow-hidden rounded-3xl border-2"
                style={{
                  backgroundColor: preset.cardBg,
                  borderColor: selected ? colors.text : colors.border,
                  borderWidth: selected ? 2 : 0,
                  aspectRatio: 0.85,
                }}
              >
                {preset.id === 'gentil' && (
                  <View
                    className="absolute left-3 top-3 z-10 rounded-full px-2 py-0.5"
                    style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                  >
                    <Text className="font-fraunces text-[10px] uppercase tracking-wider text-white">
                      cor padrão
                    </Text>
                  </View>
                )}
                {preset.isDynamic && (
                  <View
                    className="absolute left-3 top-3 z-10 h-8 w-8 items-center justify-center rounded-full"
                    style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
                  >
                    <Play color={preset.cardTextColor} size={14} />
                  </View>
                )}
                {selected && (
                  <View
                    className="absolute right-3 top-3 z-10 h-8 w-8 items-center justify-center rounded-full"
                    style={{ backgroundColor: colors.text }}
                  >
                    <Check color={colors.bg} size={16} strokeWidth={2.5} />
                  </View>
                )}
                <View className="flex-1 items-center justify-center px-4">
                  <Text
                    className="font-fraunces-bold text-xl"
                    style={{ color: preset.cardTextColor }}
                  >
                    Gentil
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-12 flex-1">
          <Text
            className="font-fraunces-bold text-center text-2xl leading-tight"
            style={{ color: colors.text }}
          >
            Qual ícone você gostaria de utilizar?
          </Text>
          <Text
            className="mt-2 font-fraunces text-center"
            style={{ color: colors.muted }}
          >
            Escolha entre nossos ícones personalizados
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
