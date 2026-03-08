import { ActivityIndicator, Pressable, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export default function PrimaryButton({ label, onPress, loading, disabled }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className="w-full min-h-14 items-center self-center rounded-[14px] py-3.5 justify-center border-2"
      style={{ backgroundColor: colors.bg, opacity: disabled ? 0.7 : 1, borderColor: colors.accent }}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <Text
          className="font-fraunces letter-spacing-2 text-[18px]"
          style={{ color: colors.text }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
