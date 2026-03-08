import { useRef, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
  Share as NativeShare,
  Dimensions,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';
import {
  X,
  Download,
  Copy,
  Instagram,
  MessageCircle,
  Share2,
} from 'lucide-react-native';

import { useTheme } from '../context/ThemeContext';
import { Affirmation } from '../lib/affirmations';

type Props = {
  visible: boolean;
  onClose: () => void;
  affirmation: Affirmation;
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_HEIGHT = CARD_WIDTH * 1.6; // Aspect ratio ~9:16

export default function ShareModal({ visible, onClose, affirmation }: Props) {
  const { colors } = useTheme();
  const viewShotRef = useRef<ViewShot>(null);
  const [capturing, setCapturing] = useState(false);

  const captureImage = async () => {
    if (viewShotRef.current?.capture) {
      try {
        const uri = await viewShotRef.current.capture();
        return uri;
      } catch (error) {
        console.error('Failed to capture view:', error);
        Alert.alert('Erro', 'Não foi possível gerar a imagem.');
        return null;
      }
    }
    return null;
  };

  const handleSaveImage = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para salvar a imagem.');
      return;
    }

    setCapturing(true);
    const uri = await captureImage();
    setCapturing(false);

    if (uri) {
      try {
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert('Sucesso', 'Imagem salva na galeria!');
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível salvar a imagem.');
      }
    }
  };

  const handleCopyText = async () => {
    await Clipboard.setStringAsync(`"${affirmation.texto}"\n\n— Gentil App`);
    Alert.alert('Copiado', 'Texto copiado para a área de transferência.');
  };

  const handleShare = async () => {
    setCapturing(true);
    const uri = await captureImage();
    setCapturing(false);

    if (uri) {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Erro', 'Compartilhamento não disponível neste dispositivo.');
      }
    }
  };

  const handleInstagramStories = async () => {
    setCapturing(true);
    const uri = await captureImage();
    setCapturing(false);

    if (uri) {
      // Basic approach: just share the image. 
      // Deep linking to stories is complex without specific schemes, usually handled by shareAsync
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
            UTI: 'com.instagram.exclusivegram', // iOS only attempt
            mimeType: 'image/png',
        });
      }
    }
  };

  const handleWhatsApp = async () => {
    setCapturing(true);
    const uri = await captureImage();
    setCapturing(false);

    if (uri) {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Compartilhar no WhatsApp',
          UTI: 'public.image',
        });
      } else {
        Alert.alert('Erro', 'Compartilhamento não disponível.');
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/90">
        {/* Header */}
        <View className="flex-row justify-between px-6 pt-14 pb-4">
          <Pressable onPress={onClose} className="p-2">
            <X color="#fff" size={28} />
          </Pressable>
        </View>

        {/* Content */}
        <View className="flex-1 items-center justify-center gap-8">
          
          {/* Card Preview */}
          <ViewShot
            ref={viewShotRef}
            options={{ format: 'png', quality: 1 }}
            style={{
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              borderRadius: 24,
              backgroundColor: colors.bg, // Using card color as base
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 32,
            }}
          >
            {/* Background Image Placeholder - In real app, this could be an image */}
            <View 
                style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: colors.bg,
                    opacity: 0.8,
                }} 
            />
            
            <Text
              className="font-fraunces-bold text-center text-3xl leading-10 shadow-sm"
              style={{ color: colors.text }} // Always white on card for contrast
            >
              {affirmation.texto}
            </Text>

            <View className="absolute bottom-8 items-center">
              <Text className="font-fraunces text-xs uppercase tracking-widest" style={{ color: colors.text }}>
                Gentil App
              </Text>
            </View>
          </ViewShot>

          {/* Actions */}
          <View className="w-full gap-6 px-8">
            {/* Row 1: Actions */}
            <View className="flex-row justify-around">
              <ActionButton 
                icon={<Download size={24} color="#fff" />} 
                label="Salvar" 
                onPress={handleSaveImage} 
              />
              <ActionButton 
                icon={<Copy size={24} color="#fff" />} 
                label="Copiar" 
                onPress={handleCopyText} 
              />
              <ActionButton 
                icon={<Share2 size={24} color="#fff" />} 
                label="Outros" 
                onPress={handleShare} 
              />
            </View>

            {/* Row 2: Socials */}
            <View className="flex-row justify-around border-t border-white/20 pt-6">
                <SocialButton
                    icon={<Instagram size={28} color="#E1306C" />} // Instagram color
                    label="Stories"
                    onPress={handleInstagramStories}
                />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ActionButton({ icon, label, onPress }: { icon: React.ReactNode, label: string, onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="items-center gap-2">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-white/10 border border-white/20">
        {icon}
      </View>
      <Text className="font-fraunces text-xs text-white">{label}</Text>
    </Pressable>
  );
}

function SocialButton({ icon, label, onPress }: { icon: React.ReactNode, label: string, onPress: () => void }) {
    return (
      <Pressable onPress={onPress} className="items-center gap-2">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-white">
          {icon}
        </View>
        <Text className="font-fraunces text-xs text-white">{label}</Text>
      </Pressable>
    );
  }
