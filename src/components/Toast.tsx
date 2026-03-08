import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react-native';
import type { ToastType } from '../hooks/useToast';
import { useTheme } from '../context/ThemeContext';

type Props = {
  message: string;
  type?: ToastType;
  visible: boolean;
  onHide: () => void;
};

export default function Toast({ message, type = 'error', visible, onHide }: Props) {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const config = {
    error: { color: colors.error, Icon: AlertCircle },
    success: { color: colors.accent, Icon: CheckCircle },
    info: { color: colors.muted, Icon: Info },
  };

  const { color, Icon } = config[type];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 18,
          stiffness: 260,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(onHide, 4000);
      return () => clearTimeout(timer);
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -120,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={{ transform: [{ translateY }], opacity }}
      className="absolute inset-x-4 top-3 z-50"
    >
      <View className="flex-row items-center gap-3 rounded-2xl border border-gentil-border bg-gentil-card px-4 py-3.5 shadow-lg">
        <View className="w-0.5 self-stretch rounded-full" style={{ backgroundColor: color }} />
        <Icon color={color} size={18} />
        <Text className="flex-1 font-fraunces text-sm leading-5 text-white">{message}</Text>
        <Pressable onPress={onHide} hitSlop={10}>
          <X color="rgba(255,255,255,0.4)" size={16} />
        </Pressable>
      </View>
    </Animated.View>
  );
}
