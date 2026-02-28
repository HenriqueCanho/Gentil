import { ActivityIndicator, Pressable, Text } from 'react-native';
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
      style={({ pressed }) => ({
        backgroundColor: COLORS.accent,
        borderRadius: 14,
        paddingVertical: 14,
        minHeight: 56,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed || disabled ? 0.85 : 1,
        width: '100%',
      })}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.text} />
      ) : (
        <Text
          style={{
            fontFamily: 'Fraunces_600SemiBold',
            fontSize: 19,
            color: COLORS.text,
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
