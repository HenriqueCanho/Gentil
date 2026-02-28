import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { COLORS } from '../theme/colors';

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
};

export default function SelectField({
  value,
  onChange,
  options,
  placeholder = 'Escolha',
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          backgroundColor: COLORS.inputBg,
          borderWidth: 1,
          borderColor: COLORS.border,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <Text
          style={{
            color: value ? COLORS.text : COLORS.muted,
            fontSize: 16,
            fontFamily: 'Fraunces_400Regular',
          }}
        >
          {value || placeholder}
        </Text>
        <Text style={{ color: COLORS.muted, fontSize: 12 }}>▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="slide">
        <Pressable
          style={{ flex: 1, backgroundColor: COLORS.overlay }}
          onPress={() => setOpen(false)}
        />
        <View
          style={{
            backgroundColor: COLORS.card,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '60%',
            paddingBottom: 32,
          }}
        >
          <View
            style={{
              alignItems: 'center',
              paddingVertical: 12,
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: COLORS.border,
              }}
            />
          </View>
          <ScrollView>
            {options.map((opt) => (
              <Pressable
                key={opt}
                onPress={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                style={({ pressed }) => ({
                  paddingHorizontal: 24,
                  paddingVertical: 16,
                  backgroundColor:
                    opt === value
                      ? COLORS.accentDim
                      : pressed
                      ? COLORS.inputBg
                      : 'transparent',
                })}
              >
                <Text
                  style={{
                    color: opt === value ? COLORS.accent : COLORS.text,
                    fontSize: 16,
                    fontFamily:
                      opt === value
                        ? 'Fraunces_600SemiBold'
                        : 'Fraunces_400Regular',
                  }}
                >
                  {opt}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
