import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { LogOut, ShieldCheck } from 'lucide-react-native';

import {
  createAffirmation,
  listAffirmations,
  type Affirmation,
} from '../lib/affirmations';
import { supabase } from '../lib/supabase';

export default function DashboardScreen() {
  const [userEmail, setUserEmail] = useState<string>('Conta conectada');
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [isLoadingAffirmations, setIsLoadingAffirmations] = useState(true);
  const [isCreatingAffirmation, setIsCreatingAffirmation] = useState(false);

  const loadAffirmations = async () => {
    try {
      setIsLoadingAffirmations(true);
      const data = await listAffirmations(10);
      setAffirmations(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao carregar afirmacoes.';
      Alert.alert('Supabase', message);
    } finally {
      setIsLoadingAffirmations(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (isMounted && data.user?.email) {
        setUserEmail(data.user.email);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    loadAffirmations();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert('Falha ao sair', error.message);
    }
  };

  const handleCreateExampleAffirmation = async () => {
    try {
      setIsCreatingAffirmation(true);
      const created = await createAffirmation({
        texto: 'Eu escolho evoluir com calma e constancia.',
        categoria: 'autoconfianca',
        linguagem: 'pt-BR',
      });
      setAffirmations((current) => [created, ...current].slice(0, 10));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao criar afirmacao.';
      Alert.alert('Supabase', message);
    } finally {
      setIsCreatingAffirmation(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-950 px-6 py-10">
      <View className="mb-8 flex-row items-center gap-3 pt-2">
        <View className="h-12 w-12 items-center justify-center rounded-xl bg-yellow-400/20">
          <ShieldCheck color="#facc15" size={24} />
        </View>
        <View>
          <Text className="text-2xl font-bold text-slate-50">Gentil</Text>
          <Text className="text-slate-400">Sessao autenticada com Supabase</Text>
        </View>
      </View>

      <View className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <Text className="mb-2 text-slate-400">Usuario atual</Text>
        <Text className="text-base font-semibold text-slate-100">{userEmail}</Text>
      </View>

      <View className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-slate-50">Affirmations</Text>
          <Pressable onPress={loadAffirmations}>
            <Text className="font-medium text-yellow-400">Atualizar</Text>
          </Pressable>
        </View>

        {isLoadingAffirmations ? (
          <ActivityIndicator color="#facc15" />
        ) : affirmations.length === 0 ? (
          <Text className="text-slate-400">
            Nenhuma afirmacao ainda. Crie a primeira abaixo.
          </Text>
        ) : (
          <View className="gap-3">
            {affirmations.map((item) => (
              <View key={item.id} className="rounded-xl border border-slate-800 p-3">
                <Text className="text-slate-100">{item.texto}</Text>
                <Text className="mt-1 text-xs text-slate-400">
                  {item.categoria} | {item.linguagem}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <Pressable
        className="mt-6 items-center rounded-xl bg-yellow-400 px-4 py-3"
        disabled={isCreatingAffirmation}
        onPress={handleCreateExampleAffirmation}
      >
        {isCreatingAffirmation ? (
          <ActivityIndicator color="#0f172a" />
        ) : (
          <Text className="font-semibold text-slate-900">Criar affirmation de exemplo</Text>
        )}
      </Pressable>

      <Pressable
        className="mt-6 flex-row items-center justify-center gap-2 rounded-xl bg-red-500/90 px-4 py-3"
        onPress={handleSignOut}
      >
        <LogOut color="#fff" size={18} />
        <Text className="font-semibold text-white">Sair</Text>
      </Pressable>
    </ScrollView>
  );
}
