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
      className="flex-row items-center gap-4 bg-gentil-bg border-b-2 border-gentil-border rounded-xl px-4 py-3"
    >
      <Text className={`font-fraunces ${selected ? 'text-gentil-accent' : 'text-gentil-muted'} text-[22px] max-h-7 max-w-5 leading-7 text-center`}>
        {selected ? '✓' : '+'}
      </Text>
      <Text
        className="font-fraunces text-white text-[14px] flex-1"
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}
