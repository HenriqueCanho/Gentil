import AsyncStorage from '@react-native-async-storage/async-storage';

const APP_PREFERENCES_KEY = '@gentil_app_preferences';

export type AppThemeMode = 'gentil' | 'gentil invertido' | 'light' | 'fada' | 'warm' | 'storm';
export type MainAnimationMode = 'fade' | 'slide' | 'scale';

export type AppPreferences = {
  themeMode: AppThemeMode;
  mainAnimationMode: MainAnimationMode;
  showCategoryTags: boolean;
  dailyReadingGoal: number;
};

const DEFAULT_PREFERENCES: AppPreferences = {
  themeMode: 'gentil',
  mainAnimationMode: 'fade',
  showCategoryTags: true,
  dailyReadingGoal: 5,
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

