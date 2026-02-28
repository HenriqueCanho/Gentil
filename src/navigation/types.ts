export type RootStackParamList = {
  Onboarding: undefined;
  Login: { fromOnboarding?: boolean };
  Register: { fromOnboarding?: boolean };
  MainTabs: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Library: undefined;
  Favorites: undefined;
  Settings: undefined;
};
