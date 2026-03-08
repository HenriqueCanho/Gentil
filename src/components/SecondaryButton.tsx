import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export default function SecondaryButton({ label, onPress, disabled }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="w-full"
      style={({ pressed }) => ({
        opacity: pressed || disabled ? 0.7 : 1,
      })}
    >
      <View
        className="w-full items-center rounded-[14px] py-4"
        style={{
          borderWidth: 2,
          borderColor: colors.accent,
          backgroundColor: colors.bg,
        }}
      >
        <Text
          className="font-fraunces-semi text-base letter-spacing-2 text-[18px]"
          style={{ color: colors.text }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
