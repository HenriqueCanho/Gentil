import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Fraunces_400Regular,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import type { Session } from '@supabase/supabase-js';

import './global.css';

import { supabase } from './src/lib/supabase';
import {
  requestNotificationPermissions,
  scheduleDailyNotifications,
  registerPushToken,
  loadNotificationPrefs,
} from './src/lib/notifications';
import { syncOnboardingToSupabase } from './src/lib/profiles';
import type { RootStackParamList } from './src/navigation/types';
import { COLORS } from './src/theme/colors';

import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import MainTabNavigator from './src/screens/MainTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const [fontsLoaded] = useFonts({
    Fraunces_400Regular,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;
      setSession(data.session);
      setIsLoadingSession(false);
    }

    init().catch(() => setIsLoadingSession(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);

      if (nextSession) {
        // After sign-in: sync onboarding data, set up notifications
        await syncOnboardingToSupabase().catch(() => {});
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
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!fontsLoaded || isLoadingSession) {
    return (
      <View className="flex-1 items-center justify-center bg-gentil-bg">
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  // Determine initial route
  let initialRoute: keyof RootStackParamList;
  if (session) {
    initialRoute = 'MainTabs';
  } else {
    initialRoute = 'Onboarding';
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        {session && (
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
