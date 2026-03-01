import AsyncStorage from '@react-native-async-storage/async-storage';

const APP_PREFERENCES_KEY = '@gentil_app_preferences';

export type AppThemeMode = 'gentil' | 'sunset' | 'ocean';
export type MainAnimationMode = 'fade' | 'slide' | 'scale';

export type AppPreferences = {
  themeMode: AppThemeMode;
  mainAnimationMode: MainAnimationMode;
  showCategoryTags: boolean;
};

const DEFAULT_PREFERENCES: AppPreferences = {
  themeMode: 'gentil',
  mainAnimationMode: 'fade',
  showCategoryTags: true,
};

export async function loadAppPreferences(): Promise<AppPreferences> {
  const raw = await AsyncStorage.getItem(APP_PREFERENCES_KEY);
  if (!raw) return DEFAULT_PREFERENCES;

  try {
    return {
      ...DEFAULT_PREFERENCES,
      ...(JSON.parse(raw) as Partial<AppPreferences>),
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function saveAppPreferences(
  patch: Partial<AppPreferences>
): Promise<AppPreferences> {
  const current = await loadAppPreferences();
  const next = { ...current, ...patch };
  await AsyncStorage.setItem(APP_PREFERENCES_KEY, JSON.stringify(next));
  return next;
}

export function getThemePalette(mode: AppThemeMode): {
  accent: string;
  accentSoft: string;
  surface: string;
} {
  if (mode === 'sunset') {
    return {
      accent: '#FB923C',
      accentSoft: 'rgba(251,146,60,0.15)',
      surface: 'rgba(251,146,60,0.08)',
    };
  }

  if (mode === 'ocean') {
    return {
      accent: '#38BDF8',
      accentSoft: 'rgba(56,189,248,0.15)',
      surface: 'rgba(56,189,248,0.08)',
    };
  }

  return {
    accent: '#D4AF37',
    accentSoft: 'rgba(212,175,55,0.15)',
    surface: 'rgba(212,175,55,0.08)',
  };
}
