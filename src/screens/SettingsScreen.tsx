import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { LogOut, Bell, User, Flame } from 'lucide-react-native';

import { supabase } from '../lib/supabase';
import { loadUserStreak } from '../lib/streaks';
import { loadNotificationPrefs, saveNotificationPrefs } from '../lib/notifications';
import PrimaryButton from '../components/PrimaryButton';
import { COLORS } from '../theme/colors';

function SettingRow({
  icon,
  title,
  subtitle,
  onPress,
  danger,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? COLORS.inputBg : COLORS.card,
        borderRadius: 14,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
      })}
    >
      {icon}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: 'Fraunces_600SemiBold',
            fontSize: 15,
            color: danger ? '#F87171' : COLORS.text,
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={{
              fontFamily: 'Fraunces_400Regular',
              fontSize: 13,
              color: COLORS.muted,
              marginTop: 2,
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Text style={{ color: COLORS.muted, fontSize: 18 }}>›</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const [userEmail, setUserEmail] = useState('');
  const [streak, setStreak] = useState(0);
  const [notifPerDay, setNotifPerDay] = useState(10);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? '');
    });
    loadUserStreak().then(setStreak);
    loadNotificationPrefs().then((prefs) => {
      if (prefs) setNotifPerDay(prefs.per_day);
    });
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Erro', error.message);
  };

  const incrementNotif = async () => {
    const next = Math.min(20, notifPerDay + 1);
    setNotifPerDay(next);
    await saveNotificationPrefs({ per_day: next, start_time: '08:00', end_time: '21:00' });
  };

  const decrementNotif = async () => {
    const next = Math.max(1, notifPerDay - 1);
    setNotifPerDay(next);
    await saveNotificationPrefs({ per_day: next, start_time: '08:00', end_time: '21:00' });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 40, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontFamily: 'Fraunces_700Bold',
            fontSize: 26,
            color: COLORS.text,
            marginBottom: 8,
          }}
        >
          Configurações
        </Text>

        {/* Account */}
        <View
          style={{
            backgroundColor: COLORS.card,
            borderRadius: 14,
            padding: 18,
            borderWidth: 1,
            borderColor: COLORS.border,
            gap: 4,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <User color={COLORS.accent} size={20} />
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 15, color: COLORS.text }}>
              Conta
            </Text>
          </View>
          <Text style={{ fontFamily: 'Fraunces_400Regular', fontSize: 14, color: COLORS.muted, marginTop: 4 }}>
            {userEmail}
          </Text>
        </View>

        {/* Streak */}
        <View
          style={{
            backgroundColor: COLORS.card,
            borderRadius: 14,
            padding: 18,
            borderWidth: 1,
            borderColor: COLORS.border,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Flame color={COLORS.accent} size={24} />
          <View>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 15, color: COLORS.text }}>
              Sequência atual
            </Text>
            <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 22, color: COLORS.accent }}>
              {streak} {streak === 1 ? 'dia' : 'dias'}
            </Text>
          </View>
        </View>

        {/* Notifications */}
        <View
          style={{
            backgroundColor: COLORS.card,
            borderRadius: 14,
            padding: 18,
            borderWidth: 1,
            borderColor: COLORS.border,
            gap: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Bell color={COLORS.accent} size={20} />
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 15, color: COLORS.text }}>
              Notificações por dia
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Pressable
              onPress={decrementNotif}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: COLORS.chip,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: COLORS.text, fontSize: 20 }}>−</Text>
            </Pressable>
            <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 20, color: COLORS.text, minWidth: 32, textAlign: 'center' }}>
              {notifPerDay}
            </Text>
            <Pressable
              onPress={incrementNotif}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: COLORS.accent,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: COLORS.bg, fontSize: 20 }}>+</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#F871711A' : COLORS.card,
            borderRadius: 14,
            padding: 18,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            borderWidth: 1,
            borderColor: '#F87171',
          })}
        >
          <LogOut color="#F87171" size={20} />
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 15, color: '#F87171' }}>
            Sair
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
