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
    <View style={{ width: '100%' }}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.muted}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        style={{
          backgroundColor: COLORS.inputBg,
          borderWidth: 1,
          borderColor: error ? COLORS.error : COLORS.border,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          color: COLORS.text,
          fontSize: 16,
          fontFamily: 'Fraunces_400Regular',
        }}
      />
      {error ? (
        <Text style={{ color: COLORS.error, fontSize: 12, marginTop: 4 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
