import { View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * Splash screen — loading only.
 * Shown while auth and onboarding status are being checked.
 * Does not function as onboarding or auth gate.
 */
export default function SplashScreen() {
  const { colors } = useTheme();

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: colors.bg }}
    >
      <Text
        className="mb-8 font-fraunces-bold text-[48px]"
        style={{ color: colors.text }}
      >
        Gentil
      </Text>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
}
