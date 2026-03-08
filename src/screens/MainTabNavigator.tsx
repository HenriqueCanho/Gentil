import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, View } from 'react-native';
import { ChartColumn, Menu, Palette, ScrollText, Users } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DashboardScreen from './DashboardScreen';
import MainScreen from './MainScreen';
import ProfileScreen from './ProfileScreen';
import SocialScreen from './SocialScreen';
import ThemeScreen from './ThemeScreen';
import type { MainTabParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator<MainTabParamList>();
const BAR_HEIGHT = 54;
const FAB_SIZE = 62;
const FAB_HALO = 10;

const ROUTE_ICONS = {
  Theme: Palette,
  Dashboard: ChartColumn,
  Social: Users,
  Profile: Menu,
} as const;

function GentilTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const mainActive = state.routes[state.index]?.name === 'Main';

  const tabColors = {
    active: colors.accent,
    inactive: colors.muted,
    background: colors.bg,
    border: colors.border,
    fab: colors.bg,
    pageBg: colors.accent,
  };

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: BAR_HEIGHT + insets.bottom + 1,
        paddingBottom: insets.bottom,
        justifyContent: 'flex-end',
      }} className="absolute bottom-0 left-0 right-0 "
    >
      <View
        style={{
          marginHorizontal: 22,
          height: BAR_HEIGHT,
          backgroundColor: tabColors.background,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: tabColors.border,
          shadowColor: colors.accent,
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.25,
          shadowRadius: 30,
          elevation: 12,
        }}
      >
        {(() => {
          const renderTab = (route: (typeof state.routes)[number]) => {
            const isFocused = state.index === state.routes.indexOf(route);
            const Icon = ROUTE_ICONS[route.name as keyof typeof ROUTE_ICONS];
            const color = isFocused ? tabColors.active : tabColors.inactive;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name as never);
              }
            };

            const onLongPress = () => {
              navigation.emit({ type: 'tabLongPress', target: route.key });
            };

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={descriptors[route.key]?.options?.tabBarAccessibilityLabel}
                onPress={onPress}
                onLongPress={onLongPress}
                style={({ pressed }) => ({
                  width: 46,
                  height: 52,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                {Icon ? <Icon size={24} color={color} /> : null}
              </Pressable>
            );
          };

          const leftRoutes = state.routes.slice(0, 2);
          const rightRoutes = state.routes.slice(3, 5);

          return (
            <>
              <View
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}
              >
                {leftRoutes.map(renderTab)}
              </View>
              <View style={{ width: FAB_SIZE + FAB_HALO }} />
              <View
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}
              >
                {rightRoutes.map(renderTab)}
              </View>
            </>
          );
        })()}
      </View>

      <View
        style={{
          position: 'absolute',
          left: '50%',
          top: -20,
          width: FAB_SIZE,
          height: FAB_SIZE,
          marginLeft: -(FAB_SIZE / 2),
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: FAB_SIZE + FAB_HALO,
            height: FAB_SIZE + FAB_HALO,
            left: -(FAB_HALO / 2),
            top: -(FAB_HALO / 2),
            borderRadius: (FAB_SIZE + FAB_HALO) / 2,
            backgroundColor: 'transparent',
            borderColor: tabColors.pageBg,
            borderWidth: mainActive ? 2 : 0,
          }}
        />
        <Pressable
          onPress={() => navigation.navigate('Main')}
          accessibilityRole="button"
          accessibilityLabel="Main"
          style={{
            width: FAB_SIZE,
            height: FAB_SIZE,
            borderRadius: FAB_SIZE / 2,
            backgroundColor: tabColors.fab,
            alignItems: 'center',
            justifyContent: 'center',
            borderColor: tabColors.pageBg,
            borderWidth: 2,
            shadowColor: tabColors.pageBg,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.18,
            shadowRadius: 18,
            elevation: 18,
          }}
        >
          <ScrollText size={26} color={tabColors.active} />
        </Pressable>
      </View>
    </View>
  );
}

export default function MainTabNavigator() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      tabBar={(props) => <GentilTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // No artificial bottom gap: allows content to scroll underneath floating tab bar
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tab.Screen name="Theme" component={ThemeScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Main" component={MainScreen} />
      <Tab.Screen name="Social" component={SocialScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
