import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SelectField({
  value,
  onChange,
  options,
  placeholder = 'Escolha',
}: Props) {
  const [open, setOpen] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (open) {
      overlayOpacity.setValue(0);
      sheetTranslateY.setValue(SCREEN_HEIGHT);
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 300,
        }),
      ]).start();
    }
  }, [open]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setOpen(false));
  };

  return (
    <>
      {/* Trigger */}
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
        className="w-full flex-row items-center justify-between rounded-2xl border-b-2 border-gentil-border px-5 py-4"
      >
        <Text
          numberOfLines={1}
          className={`flex-1 font-fraunces text-[17px] ${value ? 'text-white' : 'text-gentil-muted'}`}
        >
          {value || placeholder}
        </Text>
        <View className="ml-3 h-8 w-8 items-center justify-center rounded-lg">
          <ChevronDown color={COLORS.accent} size={20} />
        </View>
      </Pressable>

      {/* Modal */}
      <Modal visible={open} transparent animationType="none">
        <View className="flex-1 justify-end bg-black/80">

          {/* Overlay */}
          <Animated.View
            className="absolute inset-0 bg-black/80"
            style={{ opacity: overlayOpacity }}
          >
            <Pressable className="flex-1" onPress={handleClose} />
          </Animated.View>

          {/* Bottom sheet */}
          <Animated.View
            className="max-h-[60%] rounded-t-3xl bg-gentil-bg pb-8 pt-3"
            style={{ transform: [{ translateY: sheetTranslateY }] }}
          >
            {/* Handle */}
            <View className="mb-2 items-center">
              <View className="h-1.5 w-10 rounded-full bg-gentil-border" />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="px-3">
              {options.map((opt) => (
                <Pressable
                  key={opt}
                  onPress={() => {
                    onChange(opt);
                    handleClose();
                  }}
                  style={({ pressed }) => ({
                    backgroundColor:
                      opt === value
                        ? COLORS.accentDim
                        : pressed
                        ? COLORS.inputBg
                        : 'transparent',
                  })}
                  className="mb-1 flex-row items-center rounded-2xl border-b-2 border-gentil-border px-5 py-4"
                >
                  <Text
                    className={`flex-1 text-[17px] ${
                      opt === value
                        ? 'font-fraunces-semi text-accent'
                        : 'font-fraunces text-white'
                    }`}
                  >
                    {opt}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>

        </View>
      </Modal>
    </>
  );
}
