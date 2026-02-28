import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { supabase } from '../lib/supabase';
import { syncOnboardingToSupabase } from '../lib/profiles';
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
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setIsLoading(false);

    if (error) {
      Alert.alert('Falha no cadastro', error.message);
      return;
    }

    await syncOnboardingToSupabase();
    Alert.alert('Cadastro enviado', 'Confira seu e-mail para confirmar a conta.');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 }}>
        <Pressable
          onPress={handleBack}
          hitSlop={12}
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: COLORS.inputBg,
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <ArrowLeft color={COLORS.text} size={20} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={{
              fontFamily: 'Fraunces_700Bold',
              fontSize: 32,
              color: COLORS.text,
              marginBottom: 8,
            }}
          >
            Criar conta
          </Text>
          <Text
            style={{
              fontFamily: 'Fraunces_400Regular',
              fontSize: 15,
              color: COLORS.muted,
              marginBottom: 40,
            }}
          >
            Registre-se para começar sua jornada.
          </Text>

          <View style={{ gap: 14 }}>
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

            <View style={{ marginTop: 8, gap: 12 }}>
              <PrimaryButton label="Criar conta" onPress={handleSignUp} loading={isLoading} />
              <SecondaryButton label="Já tenho conta" onPress={handleBack} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
