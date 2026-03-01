import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, ChevronLeft } from 'lucide-react-native';
import CategoryChip from '../../components/CategoryChip';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';
import SecondaryButton from '../../components/SecondaryButton';
import SelectField from '../../components/SelectField';
import TimeRangePicker from '../../components/TimeRangePicker';
import { COLORS } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';
import {
  markOnboardingCompleted,
  saveOnboardingResponses,
  type OnboardingResponses,
} from '../../utils/onboarding';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const TOTAL_STEPS = 10;

const RELATIONSHIP_OPTIONS = [
  'Solteiro(a)',
  'Namorando',
  'Casado(a)',
  'Divorciado(a)',
  'Viúvo(a)',
  'Outro',
];
const RELIGION_OPTIONS = ['Sim', 'Não', 'Prefiro não dizer'];
const SIGNO_OPTIONS = [
  'Áries',
  'Touro',
  'Gêmeos',
  'Câncer',
  'Leão',
  'Virgem',
  'Libra',
  'Escorpião',
  'Sagitário',
  'Capricórnio',
  'Aquário',
  'Peixes',
];
const FEELING_OPTIONS = [
  'Bem',
  'Ansioso(a)',
  'Estressado(a)',
  'Triste',
  'Animado(a)',
  'Entorpecido(a)',
  'Incerto(a)',
];
const FEELING_CAUSE_OPTIONS = [
  'Trabalho',
  'Relacionamentos',
  'Saúde',
  'Finanças',
  'Família',
  'Solidão',
  'Outro',
];
const DEDICATION_OPTIONS = ['5 minutos', '10 minutos', '15 minutos', '30 minutos'];
const GOAL_OPTIONS = [
  'Melhorar autoestima',
  'Reduzir ansiedade',
  'Mais positividade',
  'Melhorar relacionamentos',
  'Foco e produtividade',
];
const TROUBLE_OPTIONS = [
  'Ansiedade',
  'Insônia',
  'Baixa autoestima',
  'Procrastinação',
  'Problemas no trabalho',
  'Conflitos',
  'Solidão',
];
const AVOIDANCE_OPTIONS = [
  'Conversas difíceis',
  'Exercitar-se',
  'Mudanças necessárias',
  'Pedir ajuda',
  'Tomar decisões',
];
const ACHIEVE_OPTIONS = [
  'Mais confiança',
  'Paz interior',
  'Melhor humor',
  'Motivação diária',
  'Autoconhecimento',
];
const CATEGORIES = [
  'Ansiedade',
  'Sonhar grande',
  'Manhã',
  'Amor próprio',
  'Pensar demais',
  'Romance',
  'Atração',
  'Diálogo interno',
  'Positividade',
  'Criança interior',
  'Propósito',
];

function H(props: { children: string; center?: boolean }) {
  return (
    <Text
      style={{
        fontFamily: 'Fraunces_700Bold',
        fontSize: 28,
        color: COLORS.text,
        textAlign: props.center ? 'center' : 'left',
        lineHeight: 36,
      }}
    >
      {props.children}
    </Text>
  );
}

function Sub(props: { children: string; center?: boolean }) {
  return (
    <Text
      style={{
        fontFamily: 'Fraunces_400Regular',
        fontSize: 15,
        color: COLORS.muted,
        textAlign: props.center ? 'center' : 'left',
        lineHeight: 22,
        marginTop: 8,
      }}
    >
      {props.children}
    </Text>
  );
}

function QuestionLabel(props: { children: string }) {
  return (
    <Text
      style={{
        fontFamily: 'Fraunces_700Bold',
        fontSize: 20,
        color: COLORS.text,
        textAlign: 'center',
        lineHeight: 28,
        marginBottom: 6,
      }}
    >
      {props.children}
    </Text>
  );
}

function QuestionHint(props: { children: string }) {
  return (
    <Text
      style={{
        fontFamily: 'Fraunces_400Regular',
        fontSize: 13,
        color: COLORS.muted,
        textAlign: 'center',
        marginBottom: 12,
      }}
    >
      {props.children}
    </Text>
  );
}

export default function OnboardingScreen({ navigation }: Props) {
  const [step, setStep] = useState(1);
  const [responses, setResponses] = useState<OnboardingResponses>({
    notificationsPerDay: 10,
    notificationStartTime: '08:00',
    notificationEndTime: '21:00',
    categories: [],
  });

  const update = (patch: Partial<OnboardingResponses>) => {
    setResponses((prev) => ({ ...prev, ...patch }));
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  const handleAuth = async (type: 'Login' | 'Register') => {
    await saveOnboardingResponses(responses);
    await markOnboardingCompleted();
    navigation.navigate(type, { fromOnboarding: true });
  };

  const incrementNotifications = () => {
    update({ notificationsPerDay: Math.min(20, (responses.notificationsPerDay ?? 10) + 1) });
  };
  const decrementNotifications = () => {
    update({ notificationsPerDay: Math.max(1, (responses.notificationsPerDay ?? 10) - 1) });
  };

  const toggleCategory = (cat: string) => {
    const current = responses.categories ?? [];
    if (current.includes(cat)) {
      update({ categories: current.filter((c) => c !== cat) });
    } else {
      update({ categories: [...current, cat] });
    }
  };

  const renderBackButton = () => (
    <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 }}>
      <Pressable
        onPress={handleBack}
        hitSlop={12}
        style={({ pressed }) => ({
          opacity: pressed ? 0.6 : 1,
          width: 40,
          height: 40,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: "white",
          backgroundColor: COLORS.inputBg,
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <ChevronLeft color={COLORS.text} size={25} />
      </Pressable>
    </View>
  );

  const renderProgressDots = () => {
    if (step === 1 || step === 10) return null;
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
        {Array.from({ length: TOTAL_STEPS - 2 }).map((_, i) => (
          <View
            key={i}
            className={`w-${i === step - 2 ? 20 : 6} h-6 bg-${i <= step - 2 ? 'accent' : 'border'}`}
          />
        ))}
      </View>
    );
  };

  // ──────────────────────────────────────────────────────────
  // STEP 1: Splash / Intro
  // ──────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <SafeAreaView className="bg-gentil-bg flex-1">
        <View className="items-center justify-center pt-16">
          <Text className="font-fraunces-bold text-center justify-end text-[52px] pt-16 text-white leading-10">Gentil</Text>
        </View>
        <View className="flex-1 justify-end px-6 gap-12">
          <Text className="font-fraunces-bold text-center text-[32px] text-white leading-10 mb-12">Melhore sua vida com afirmações positivas!</Text>
          <View className="items-center mb-8 gap-12">
            <Text className="text-accent text-2xl">★★★★★</Text>
            <Text
              className="font-fraunces text-center text-[14px] text-gentil-muted mt-2 leading-5"
            >
              "Ler isso todo dia me deixa menos ansioso e menos amargo"
            </Text>
          </View>
          <PrimaryButton label="Próximo" onPress={handleNext} />
        </View>
      </SafeAreaView>
    );
  }

  // ──────────────────────────────────────────────────────────
  // STEP 4: Motivational Interlude
  // ──────────────────────────────────────────────────────────
  if (step === 4) {
    return (
      <SafeAreaView className="bg-gentil-bg flex-1">
        {renderBackButton()}
        <View className="flex-1 justify-center px-6">
          <Text className="font-fraunces-bold text-center text-[26px] text-white leading-10">
            Através de repetições diárias podemos mudar nossa percepção sobre a realidade
          </Text>
        </View>
        <View className="px-6 pb-4">
          <PrimaryButton label="Próximo" onPress={handleNext} />
        </View>
      </SafeAreaView>
    );
  }

  // ──────────────────────────────────────────────────────────
  // STEP 10: Auth Gate
  // ──────────────────────────────────────────────────────────
  if (step === 10) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
        {renderBackButton()}
        <View className="px-6 justify-center flex-1">
          <Text
            className="font-fraunces-bold text-center text-[28px] text-white leading-10 mb-4"
          >
            Vamos manter suas informações seguras e vinculadas com sua conta
          </Text>
          <Text className="font-fraunces text-center text-[14px] text-gentil-muted leading-5"
          >
            Dessa forma conseguiremos personalizar o aplicativo para seu gosto e objetivos.
          </Text>
        </View>

        <View className="px-6 pb-4 gap-3">
          <SecondaryButton label="Login" onPress={() => handleAuth('Login')} />
          <SecondaryButton label="Cadastre-se" onPress={() => handleAuth('Register')} />
        </View>
      </SafeAreaView>
    );
  }

  // ──────────────────────────────────────────────────────────
  // Scrollable steps (2, 3, 5, 6, 7, 8, 9)
  // ──────────────────────────────────────────────────────────
  return (
    <SafeAreaView className="bg-gentil-bg flex-1">
      {renderBackButton()}
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        {renderProgressDots()}

        {/* STEP 2: Personal Info */}
        {step === 2 && (
          <View className='gap-16'>
            <View>
              <QuestionLabel>Como você quer ser chamado?</QuestionLabel>
              <QuestionHint>Seu nome aparecerá em suas afirmações</QuestionHint>
              <InputField
                value={responses.name ?? ''}
                onChangeText={(v) => update({ name: v })}
                placeholder="Seu nome aqui"
              />
            </View>
            <View>
              <QuestionLabel>Como está atualmente seu status de relacionamento?</QuestionLabel>
              <QuestionHint>Escolha a opção que melhor descreve</QuestionHint>
              <SelectField
                value={responses.relationshipStatus ?? ''}
                onChange={(v) => update({ relationshipStatus: v })}
                options={RELATIONSHIP_OPTIONS}
              />
            </View>
            <View>
              <QuestionLabel>Você é religioso?</QuestionLabel>
              <QuestionHint>Essa informação será usada em suas afirmações</QuestionHint>
              <SelectField
                value={responses.isReligious ?? ''}
                onChange={(v) => update({ isReligious: v })}
                options={RELIGION_OPTIONS}
              />
            </View>
          </View>
        )}

        {/* STEP 3: Feelings */}
        {step === 3 && (
          <View className="gap-16">
            <View>
              <QuestionLabel>Qual seu signo?</QuestionLabel>
              <QuestionHint>Essa informação será usada em suas afirmações</QuestionHint>
              <SelectField
                value={responses.signo ?? ''}
                onChange={(v) => update({ signo: v })}
                options={SIGNO_OPTIONS}
              />
            </View>
            <View>
              <QuestionLabel>Como você tem se sentido recentemente?</QuestionLabel>
              <QuestionHint>Escolha a opção que melhor descreve</QuestionHint>
              <SelectField
                value={responses.recentFeeling ?? ''}
                onChange={(v) => update({ recentFeeling: v })}
                options={FEELING_OPTIONS}
              />
            </View>
            <View>
              <QuestionLabel>O que te faz se sentir dessa maneira?</QuestionLabel>
              <QuestionHint>Essa informação será usada em suas afirmações</QuestionHint>
              <SelectField
                value={responses.feelingCause ?? ''}
                onChange={(v) => update({ feelingCause: v })}
                options={FEELING_CAUSE_OPTIONS}
              />
            </View>
          </View>
        )}

        {/* STEP 5: Notifications */}
        {step === 5 && (
          <View className="gap-12">
            <View className="mb-2 items-center justify-center text-center">
              <H center>Diga-nos quantas vezes ao dia você quer ser lembrado</H>
              <Sub center>Ler afirmações através do seu dia irá melhorá-lo.</Sub>
            </View>

            {/* Notification preview card */}
            <View className="bg-gentil-card rounded-2xl p-3 flex-row items-center gap-3">
              <View className="w-16 h-16 rounded-xl bg-gentil-bg items-center justify-center">
                <Text className="font-fraunces-semi text-white text-[12px]">Gentil</Text>
              </View>
              <View className="flex-1">
                <Text className="font-fraunces-semi text-white text-[14px]">
                  Gentil
                </Text>
                <Text className="font-fraunces text-gentil-muted text-[13px] mt-1">
                  Se você pode sonhar, pode realizar!
                </Text>
              </View>
              <Text className="absolute right-4 top-3 text-gentil-muted text-[12px]">Agora</Text>
            </View>

            {/* Counter */}
            <View className="bg-gentil-bg flex-row items-center justify-between rounded-xl border-b-2 border-gentil-border px-5 py-4 gap-2">
              <Text className="font-fraunces text-white text-[15px]">
                Quantas vezes ao dia?
              </Text>
              <View className="flex-row items-center gap-4">
                <Pressable
                  onPress={decrementNotifications}
                  className="w-8 h-8 rounded-lg bg-gentil-accent text-center items-center justify-center"
                >
                  <Text className="font-fraunces-semi text-center text-white text-[26px]">−</Text>
                </Pressable>
                <Text className="font-fraunces-semi text-white text-[15px] min-w-7 text-center">
                  {responses.notificationsPerDay}x
                </Text>
                <Pressable
                  onPress={incrementNotifications}
                  className="w-8 h-8 rounded-lg bg-gentil-accent text-center items-center justify-center"
                >
                  <Text className="font-fraunces-semi text-center text-white text-[26px]">+</Text>
                </Pressable>
              </View>
            </View>

            {/* Time range */}
            <TimeRangePicker
              startTime={responses.notificationStartTime ?? '08:00'}
              endTime={responses.notificationEndTime ?? '21:00'}
              onStartChange={(v) => update({ notificationStartTime: v })}
              onEndChange={(v) => update({ notificationEndTime: v })}
            />
          </View>
        )}

        {/* STEP 6: Dedication */}
        {step === 6 && (
          <View className="gap-16">
            <View>
              <QuestionLabel>Quanto tempo você vai se dedicar as afirmações?</QuestionLabel>
              <QuestionHint>Pode mudar depois, caso queira</QuestionHint>
              <SelectField
                value={responses.timeDedication ?? ''}
                onChange={(v) => update({ timeDedication: v })}
                options={DEDICATION_OPTIONS}
              />
            </View>
            <View>
              <QuestionLabel>Com qual meta você quer começar?</QuestionLabel>
              <QuestionHint>Pode mudar depois, caso queira</QuestionHint>
              <SelectField
                value={responses.startGoal ?? ''}
                onChange={(v) => update({ startGoal: v })}
                options={GOAL_OPTIONS}
              />
            </View>
          </View>
        )}

        {/* STEP 7: Categories */}
        {step === 7 && (
          <View className="gap-10">
            <View className="items-center mb-2">
              <H center>Por quais categorias você se interessa?</H>
              <Sub center>Elas modificarão sua experiência</Sub>
            </View>
            <View className="flex-row flex-wrap gap-4">
              {CATEGORIES.map((cat) => (
                <View key={cat} className="w-[47%]">
                  <CategoryChip
                    label={cat}
                    selected={(responses.categories ?? []).includes(cat)}
                    onToggle={() => toggleCategory(cat)}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* STEP 8: Struggles */}
        {step === 8 && (
          <View className="gap-16">
            <View>
              <QuestionLabel>O que têm te atormentado recentemente?</QuestionLabel>
              <QuestionHint>Escolha ao menos um para que te conheçamos</QuestionHint>
              <SelectField
                value={responses.troubles ?? ''}
                onChange={(v) => update({ troubles: v })}
                options={TROUBLE_OPTIONS}
              />
            </View>
            <View>
              <QuestionLabel>Tem evitado algo que deveria enfrentar?</QuestionLabel>
              <QuestionHint>Escolha ao menos um para que te conheçamos</QuestionHint>
              <SelectField
                value={responses.avoidance ?? ''}
                onChange={(v) => update({ avoidance: v })}
                options={AVOIDANCE_OPTIONS}
              />
            </View>
          </View>
        )}

        {/* STEP 9: Goals */}
        {step === 9 && (
          <View className="gap-16">
            <View>
              <QuestionLabel>O que você quer alcançar com o Gentil?</QuestionLabel>
              <QuestionHint>Escolha ao menos um para que veja afirmações baseadas em seu objetivo</QuestionHint>
              <SelectField
                value={responses.goals ?? ''}
                onChange={(v) => update({ goals: v })}
                options={ACHIEVE_OPTIONS}
              />
            </View>
          </View>
        )}
      </ScrollView>

      <View className="px-6 pb-4">
        <PrimaryButton label="Próximo" onPress={handleNext} />
      </View>
    </SafeAreaView>
  );
}
