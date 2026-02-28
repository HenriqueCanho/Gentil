import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { COLORS } from '../theme/colors';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export default function PrimaryButton({ label, onPress, loading, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className="w-full min-h-14 items-center bg-gentil-accent self-center rounded-[14px] py-3.5 justify-center"
    >
      {loading ? (
        <ActivityIndicator color={COLORS.text} />
      ) : (
        <Text className="font-fraunces letter-spacing-2 text-[18px] text-white">{label}</Text>
      )}
    </Pressable>
  );
}
