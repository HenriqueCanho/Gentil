import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { loadAppPreferences, saveAppPreferences, type AppThemeMode } from '../lib/appPreferences';
import { THEMES, type ThemeColors } from '../theme/themes';

type ThemeContextType = {
  theme: AppThemeMode;
  colors: ThemeColors;
  setTheme: (mode: AppThemeMode) => Promise<void>;
  isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppThemeMode>('gentil');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAppPreferences().then((prefs) => {
      setThemeState(prefs.themeMode);
      setIsLoading(false);
    });
  }, []);

  const setTheme = async (mode: AppThemeMode) => {
    setThemeState(mode);
    await saveAppPreferences({ themeMode: mode });
  };

  const colors = THEMES[theme];

  if (isLoading) {
     // Return null or a splash to avoid flash of wrong content?
     // Or just render children? If we render children immediately with default theme,
     // it might flash. Better to wait or show nothing if critical.
     // Given the user request for "loading states", let's render children but maybe with a loading indicator overlay if it takes too long?
     // Actually, let's just return null until loaded to prevent flash of wrong theme
     return null; 
  }

  return (
    <ThemeContext.Provider value={{ theme, colors, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
