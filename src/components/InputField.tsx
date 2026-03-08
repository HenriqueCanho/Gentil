import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

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
  secureTextEntry = false,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  error,
}: Props) {
  const [hidden, setHidden] = useState(secureTextEntry);
  const { colors } = useTheme();

  return (
    <View className="w-full">
      <View
        className="flex-row items-center rounded-2xl border-b-2"
        style={{ borderColor: error ? colors.error : colors.border }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.accent}
          secureTextEntry={hidden}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          className="flex-1 px-5 py-3.5 font-fraunces text-[17px]"
          style={{ color: colors.accent }}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            className="pr-4"
          >
            {hidden ? (
              <EyeOff color={colors.muted} size={18} />
            ) : (
              <Eye color={colors.muted} size={18} />
            )}
          </Pressable>
        )}
      </View>
      {error ? (
        <Text className="mt-1 text-xs" style={{ color: colors.error }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
