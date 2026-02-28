import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETED_KEY = '@gentil_onboarding_completed';
const ONBOARDING_RESPONSES_KEY = '@gentil_onboarding_responses';

export type OnboardingResponses = {
  name?: string;
  relationshipStatus?: string;
  isReligious?: string;
  signo?: string;
  recentFeeling?: string;
  feelingCause?: string;
  notificationsPerDay?: number;
  notificationStartTime?: string;
  notificationEndTime?: string;
  timeDedication?: string;
  startGoal?: string;
  categories?: string[];
  troubles?: string;
  avoidance?: string;
  goals?: string;
  goalsAvoidance?: string;
};

export async function isOnboardingCompleted(): Promise<boolean> {
  const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
  return value === 'true';
}

export async function markOnboardingCompleted(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
}

export async function saveOnboardingResponses(
  responses: OnboardingResponses
): Promise<void> {
  await AsyncStorage.setItem(
    ONBOARDING_RESPONSES_KEY,
    JSON.stringify(responses)
  );
}

export async function loadOnboardingResponses(): Promise<OnboardingResponses> {
  const raw = await AsyncStorage.getItem(ONBOARDING_RESPONSES_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as OnboardingResponses;
  } catch {
    return {};
  }
}

export async function resetOnboarding(): Promise<void> {
  await AsyncStorage.multiRemove([
    ONBOARDING_COMPLETED_KEY,
    ONBOARDING_RESPONSES_KEY,
  ]);
}
