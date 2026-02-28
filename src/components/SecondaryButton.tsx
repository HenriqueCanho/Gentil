import { Pressable, Text } from 'react-native';
import { COLORS } from '../theme/colors';

type Props = {
  label: string;
  onPress: () => void;
};

export default function SecondaryButton({ label, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderWidth: 1.5,
        borderColor: COLORS.accent,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        opacity: pressed ? 0.7 : 1,
        width: '100%',
        backgroundColor: 'transparent',
      })}
    >
      <Text
        style={{
          fontFamily: 'Fraunces_600SemiBold',
          fontSize: 16,
          color: COLORS.accent,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
