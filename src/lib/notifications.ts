import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { supabase } from './supabase';

export type NotificationPrefs = {
  per_day: number;
  start_time: string;
  end_time: string;
};

const DAILY_MESSAGES = [
  'Eu sou capaz de grandes coisas.',
  'Hoje será um dia incrível.',
  'Eu mereço tudo de bom.',
  'Minha mente é poderosa e positiva.',
  'Eu escolho a paz e a alegria.',
  'Estou crescendo a cada dia.',
  'Sou grato(a) por tudo que tenho.',
  'Minha energia atrai coisas boas.',
  'Eu confio em mim mesmo(a).',
  'Cada desafio me torna mais forte.',
  'Sou amado(a) e tenho valor.',
  'Hoje me dedico ao meu melhor.',
  'Paz e prosperidade fluem para mim.',
  'Escolho ver o lado positivo.',
  'Sou suficiente exatamente como sou.',
  'Minha jornada é única e especial.',
  'Atraio oportunidades incríveis.',
  'Me cuido com amor e carinho.',
  'Minha vida melhora a cada dia.',
  'Tenho tudo que preciso dentro de mim.',
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('gentil', {
      name: 'Gentil',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyNotifications(
  prefs: NotificationPrefs
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const [startH, startM] = prefs.start_time.split(':').map(Number);
  const [endH, endM] = prefs.end_time.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const totalWindow = endMinutes - startMinutes;
  const count = Math.min(prefs.per_day, DAILY_MESSAGES.length);
  const interval = Math.floor(totalWindow / count);

  for (let i = 0; i < count; i++) {
    const triggerMinutes = startMinutes + i * interval;
    const hour = Math.floor(triggerMinutes / 60);
    const minute = triggerMinutes % 60;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Gentil 🌱',
        body: DAILY_MESSAGES[i % DAILY_MESSAGES.length],
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  }
}

export async function registerPushToken(): Promise<void> {
  if (!Device.isDevice) return;

  try {
    const { data: tokenData } = await Notifications.getExpoPushTokenAsync();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('push_tokens').upsert(
      {
        user_id: user.id,
        token: tokenData,
        platform: Platform.OS,
      },
      { onConflict: 'user_id' }
    );
  } catch {
    // Non-critical – skip silently
  }
}

export async function loadNotificationPrefs(): Promise<NotificationPrefs | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('user_notification_prefs')
    .select('per_day, start_time, end_time')
    .eq('user_id', user.id)
    .maybeSingle();

  return data as NotificationPrefs | null;
}

export async function saveNotificationPrefs(prefs: NotificationPrefs): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('user_notification_prefs').upsert(
    { user_id: user.id, ...prefs, enabled: true },
    { onConflict: 'user_id' }
  );

  await scheduleDailyNotifications(prefs);
}
