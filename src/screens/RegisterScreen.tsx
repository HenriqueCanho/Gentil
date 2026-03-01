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
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { supabase } from '../lib/supabase';
import type { RootStackParamList } from '../navigation/types';
import { COLORS } from '../theme/colors';
import {
  hasValidationErrors,
  validateRegisterForm,
  type AuthFormErrors,
} from '../utils/authValidation';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Login', {});
  };

  const handleSignUp = async () => {
    const formErrors = validateRegisterForm({ email, password, confirmPassword });
    setErrors(formErrors);
    if (hasValidationErrors(formErrors)) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        showToast(error.message);
        return;
      }

      showToast('Confira seu e-mail para confirmar a conta.', 'success');
      // Navigation handled by App.tsx when session is confirmed
    } catch (e) {
      showToast('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gentil-bg">
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />

      <View className="px-4 py-2">
        <Pressable
          onPress={handleBack}
          hitSlop={12}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          className="h-10 w-10 items-center justify-center rounded-full border border-white bg-gentil-input"
        >
          <ChevronLeft color={COLORS.text} size={22} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text className="mb-2 font-fraunces-bold text-[32px] text-white">Criar conta</Text>
          <Text className="mb-10 font-fraunces text-[15px] text-gentil-muted">
            Registre-se para começar sua jornada.
          </Text>

          <View className="gap-3.5">
            <InputField
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
              }}
              placeholder="E-mail"
              autoCapitalize="none"
              keyboardType="email-address"
              error={errors.email}
            />
            <InputField
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                setErrors((e) => ({ ...e, password: undefined, confirmPassword: undefined }));
              }}
              placeholder="Senha (mín. 6 caracteres)"
              secureTextEntry
              error={errors.password}
            />
            <InputField
              value={confirmPassword}
              onChangeText={(v) => {
                setConfirmPassword(v);
                if (errors.confirmPassword)
                  setErrors((e) => ({ ...e, confirmPassword: undefined }));
              }}
              placeholder="Confirmar senha"
              secureTextEntry
              error={errors.confirmPassword}
            />

            <View className="mt-2 gap-3">
              <PrimaryButton label="Criar conta" onPress={handleSignUp} loading={isLoading} />
              <SecondaryButton label="Já tenho conta" onPress={handleBack} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
