import { Modal, Pressable, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export default function ConfirmationModal({
  visible,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  loading,
}: Props) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View
          className="w-full max-w-sm overflow-hidden rounded-3xl border p-6 shadow-xl"
          style={{
            backgroundColor: colors.bg,
            borderColor: colors.border,
          }}
        >
          <Text
            className="mb-2 text-center font-fraunces-bold text-xl"
            style={{ color: colors.text }}
          >
            {title}
          </Text>
          
          <Text
            className="mb-8 text-center font-fraunces text-base leading-6"
            style={{ color: colors.muted }}
          >
            {message}
          </Text>

          <View className="flex-row gap-4">
            <Pressable
              onPress={onCancel}
              disabled={loading}
              className="flex-1 items-center justify-center rounded-xl border py-3.5"
              style={{
                backgroundColor: 'transparent',
                borderColor: colors.border,
              }}
            >
              <Text
                className="font-fraunces-semi text-base"
                style={{ color: colors.text }}
              >
                {cancelText}
              </Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              disabled={loading}
              className="flex-1 items-center justify-center rounded-xl border py-3.5"
              style={{
                backgroundColor: colors.error,
                borderColor: colors.error,
                opacity: loading ? 0.7 : 1,
              }}
            >
              <Text
                className="font-fraunces-semi text-base text-white"
              >
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
