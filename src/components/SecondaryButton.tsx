import { Pressable, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
};

export default function SecondaryButton({ label, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="w-full items-center rounded-[14px] border-[1.5px] border-gentil-accent bg-transparent py-4"
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <Text className="font-fraunces-semi text-base text-gentil-accent">{label}</Text>
    </Pressable>
  );
}
