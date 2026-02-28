import { TextInput, View, Text } from 'react-native';
import { COLORS } from '../theme/colors';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric';
  error?: string;
};

export default function InputField({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  error,
}: Props) {
  return (
    <View className="w-full">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.muted}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        className={`rounded-2xl border-b-2 bg-gentil px-5 py-3.5 font-fraunces text-[17px] text-white ${error ? 'border-red-400' : 'border-gentil-border'}`}
      />
      {error ? (
        <Text className="mt-1 text-xs text-red-400">{error}</Text>
      ) : null}
    </View>
  );
}
