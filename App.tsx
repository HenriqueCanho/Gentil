import { useEffect, useRef, useState } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  Fraunces_400Regular,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import type { Session } from '@supabase/supabase-js';

import './global.css';

import { supabase } from './src/lib/supabase';
import { getProfile } from './src/lib/profiles';
import {
  requestNotificationPermissions,
  scheduleDailyNotifications,
  registerPushToken,
  loadNotificationPrefs,
} from './src/lib/notifications';
import type { RootStackParamList, AuthGateRoute } from './src/navigation/types';
import { COLORS } from './src/theme/colors';
import {
  isOnboardingCompleted,
  resetOnboarding,
} from './src/utils/onboarding';

import SplashScreenComponent from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import MainTabNavigator from './src/screens/MainTabNavigator';
import RepostsScreen from './src/screens/RepostsScreen';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Mantém o splash nativo visível até fontes carregarem
SplashScreen.preventAutoHideAsync();

const SESSION_TIMEOUT_MS = 6000;

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function getTargetRoute(
  session: Session | null,
  onboardingCompleted: boolean
): AuthGateRoute {
  if (!session) return 'Login';
  if (!onboardingCompleted) return 'Onboarding';
  return 'MainTabs';
}

function AppContent() {
  const { colors, theme, isLoading: isThemeLoading } = useTheme();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);
  const [isNavReady, setIsNavReady] = useState(false);
  const prevRouteRef = useRef<AuthGateRoute | null>(null);

  const [fontsLoaded] = useFonts({
    Fraunces_400Regular,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });

  // 1. Auth check (session)
  useEffect(() => {
    let mounted = true;

    async function init() {
      const timeout = (ms: number) =>
        new Promise<{ data: { session: null } }>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), ms)
        );

      try {
        const { data } = await Promise.race([
          supabase.auth.getSession(),
          timeout(SESSION_TIMEOUT_MS),
        ]);
        if (!mounted) return;
        setSession(data.session);
      } catch {
        if (!mounted) return;
        setSession(null);
      } finally {
        if (mounted) setIsLoadingSession(false);
      }
    }

    init();
  }, []);

  // 2. Onboarding check (only when authenticated)
  useEffect(() => {
    if (isLoadingSession || !session) {
      setOnboardingCompleted(false);
      setHasCheckedOnboarding(false);
      return;
    }

    let mounted = true;

    async function checkOnboarding() {
      try {
        const fromStorage = await isOnboardingCompleted();
        if (fromStorage) {
          if (mounted) setOnboardingCompleted(true);
          return;
        }
        const profile = await getProfile();
        if (mounted) setOnboardingCompleted(profile?.onboarding_completed ?? false);
      } catch {
        if (mounted) setOnboardingCompleted(false);
      } finally {
        if (mounted) setHasCheckedOnboarding(true);
      }
    }

    checkOnboarding();
  }, [session, isLoadingSession]);

  // 3. Auth state listener (login / logout)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);

      if (nextSession) {
        const granted = await requestNotificationPermissions();
        if (granted) {
          const prefs = await loadNotificationPrefs().catch(() => null);
          if (prefs) {
            await scheduleDailyNotifications(prefs).catch(() => {});
          } else {
            await scheduleDailyNotifications({
              per_day: 10,
              start_time: '08:00',
              end_time: '21:00',
            }).catch(() => {});
          }
          await registerPushToken().catch(() => {});
        }
      } else {
        setOnboardingCompleted(false);
        setHasCheckedOnboarding(false);
        await resetOnboarding(); // Clear local onboarding so next user starts fresh
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 4. Navigate when auth + onboarding status ready
  useEffect(() => {
    const loading =
      !fontsLoaded ||
      isLoadingSession ||
      isThemeLoading ||
      (!!session && !hasCheckedOnboarding);
    if (loading) return;
    if (!isNavReady) return;

    const target = getTargetRoute(session, onboardingCompleted);

    if (prevRouteRef.current === target) return;
    prevRouteRef.current = target;

    navigationRef.reset({
      index: 0,
      routes: [{ name: target }],
    });
  }, [fontsLoaded, isLoadingSession, isThemeLoading, onboardingCompleted, hasCheckedOnboarding, session, isNavReady]);

  // 5. Hide native splash when fonts ready
  useEffect(() => {
    if (fontsLoaded && !isThemeLoading) SplashScreen.hide();
  }, [fontsLoaded, isThemeLoading]);

  if (!fontsLoaded || isThemeLoading) {
    return null; // Native splash visible until fonts load
  }

  const isLightMode = ['gentil invertido', 'light', 'warm'].includes(theme);

  return (
    <NavigationContainer ref={navigationRef} onReady={() => setIsNavReady(true)}>
      <StatusBar style={isLightMode ? 'dark' : 'light'} />
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreenComponent} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen
          name="Reposts"
          component={RepostsScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
