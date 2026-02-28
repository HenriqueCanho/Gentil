import { Pressable, Text } from 'react-native';
import { COLORS } from '../theme/colors';

type Props = {
  label: string;
  selected: boolean;
  onToggle: () => void;
};

export default function CategoryChip({ label, selected, onToggle }: Props) {
  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: selected ? COLORS.accent + '30' : COLORS.chip,
        borderWidth: selected ? 1.5 : 1,
        borderColor: selected ? COLORS.accent : COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        opacity: pressed ? 0.8 : 1,
        flex: 1,
      })}
    >
      <Text
        style={{
          color: selected ? COLORS.accent : COLORS.muted,
          fontSize: 16,
          fontFamily: 'Fraunces_400Regular',
        }}
      >
        {selected ? '✓' : '+'}
      </Text>
      <Text
        style={{
          color: COLORS.text,
          fontSize: 14,
          fontFamily: 'Fraunces_400Regular',
          flex: 1,
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}
