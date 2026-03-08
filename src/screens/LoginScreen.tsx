import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { supabase } from '../lib/supabase';
import type { RootStackParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';
import {
  hasValidationErrors,
  validateLoginForm,
  type AuthFormErrors,
} from '../utils/authValidation';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const canGoBack = navigation.canGoBack();

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  const handleSignIn = async () => {
    const formErrors = validateLoginForm({ email, password });
    setErrors(formErrors);
    if (hasValidationErrors(formErrors)) return;

    setIsLoading(true);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout na conexão')), 15000)
    );

    try {
      const signInPromise = supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      const { data, error } = (await Promise.race([
        signInPromise,
        timeoutPromise,
      ])) as any;

      if (error) {
        showToast(error.message);
        setIsLoading(false);
        return;
      }
      // Success: App.tsx handles navigation via onAuthStateChange
    } catch (e: any) {
      showToast(e.message === 'Timeout na conexão' ? 'A conexão está demorando muito. Verifique sua internet.' : 'Erro inesperado. Tente novamente.');
      setIsLoading(false);
    }
  };
  const bottomPadding = 24 + insets.bottom;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.bg }}>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />

      <View className="px-4 py-2">
        {canGoBack && (
          <Pressable
            onPress={handleBack}
            hitSlop={12}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
              borderColor: colors.border,
              backgroundColor: colors.inputBg,
            })}
            className="h-10 w-10 items-center justify-center"
          >
            <ChevronLeft color={colors.text} size={22} />
          </Pressable>
        )}
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: 24,
            paddingBottom: bottomPadding,
            justifyContent: 'center',
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text className="mb-2 font-fraunces-bold text-[32px]" style={{ color: colors.text }}>
            Entrar
          </Text>
          <Text className="mb-10 font-fraunces text-[15px]" style={{ color: colors.text }}>
            Acesse sua conta no Gentil.
          </Text>

          <View className="gap-3.5">
            <InputField
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="E-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            <InputField
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="Senha"
              secureTextEntry
              error={errors.password}
            />

            <View className="mt-2 items-end">
              <Text className="font-fraunces text-sm" style={{ color: colors.muted }}>
                Esqueceu a senha?
              </Text>
            </View>

            <PrimaryButton
              label={isLoading ? 'Entrando...' : 'Entrar'}
              onPress={handleSignIn}
              disabled={isLoading}
            />
            <SecondaryButton
              label="Criar conta"
              onPress={() => navigation.navigate('Register')}
              disabled={isLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
