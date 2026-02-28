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
  validateLoginForm,
  type AuthFormErrors,
} from '../utils/authValidation';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const canGoBack = navigation.canGoBack();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleSignIn = async () => {
    const formErrors = validateLoginForm({ email, password });
    setErrors(formErrors);
    if (hasValidationErrors(formErrors)) return;

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setIsLoading(false);

    if (error) {
      Alert.alert('Falha no login', error.message);
      return;
    }

    await syncOnboardingToSupabase();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 }}>
        {canGoBack && (
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
        )}
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
            Entrar
          </Text>
          <Text
            style={{
              fontFamily: 'Fraunces_400Regular',
              fontSize: 15,
              color: COLORS.muted,
              marginBottom: 40,
            }}
          >
            Acesse sua conta no Gentil.
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
                if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
              }}
              placeholder="Senha"
              secureTextEntry
              error={errors.password}
            />

            <View style={{ marginTop: 8, gap: 12 }}>
              <PrimaryButton label="Entrar" onPress={handleSignIn} loading={isLoading} />
              <SecondaryButton label="Criar conta" onPress={() => navigation.navigate('Register', {})} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
