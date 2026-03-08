export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
  Reposts: undefined;
};

/** Target route after auth + onboarding gating */
export type AuthGateRoute = 'Login' | 'Onboarding' | 'MainTabs';

export type MainTabParamList = {
  Theme: undefined;
  Dashboard: undefined;
  Main: undefined;
  Social: undefined;
  Profile: undefined;
};
