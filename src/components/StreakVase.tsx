import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Sequential images from empty vase (vaso1) to full bouquet (vaso8)
const VASE_STAGES = [
  require('../../assets/vase of flowers/vaso1.png'),
  require('../../assets/vase of flowers/vaso2.png'),
  require('../../assets/vase of flowers/vaso3.png'),
  require('../../assets/vase of flowers/vaso4.png'),
  require('../../assets/vase of flowers/vaso5.png'),
  require('../../assets/vase of flowers/vaso6.png'),
  require('../../assets/vase of flowers/vaso7.png'),
  require('../../assets/vase of flowers/vaso8.png'),
];

type Props = {
  streak: number;
  interactive?: boolean;
};

export default function StreakVase({ streak, interactive = false }: Props) {
  const { colors } = useTheme();
  // Internal state to simulate progress in interactive mode
  // Default to the actual streak
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    // Map streak days to image index (0 to 7)
    // Example: Day 1 -> Index 0 (vaso1), Day 2 -> Index 1 (vaso2), etc.
    // If streak is 0, we can decide to show vaso1 (empty) or handle differently.
    // Assuming streak 1 = vaso1. So index = streak - 1.
    // Clamp between 0 and 7.
    const index = Math.min(Math.max(streak - 1, 0), VASE_STAGES.length - 1);
    setCurrentStageIndex(index);
  }, [streak]);

  const handlePress = () => {
    if (interactive) {
      // Cycle through stages for testing
      setCurrentStageIndex((prev) => (prev + 1) % VASE_STAGES.length);
    }
  };

  const currentImage = VASE_STAGES[currentStageIndex];

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <View style={styles.contentContainer}>
        <Image
          source={currentImage}
          style={[styles.vaseImage, { tintColor: colors.text }]}
          resizeMode="contain"
        />
        
        {interactive && (
          <Text style={{ position: 'absolute', bottom: -20, fontSize: 10, color: colors.muted }}>
            Toque para testar: Vaso {currentStageIndex + 1}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    aspectRatio: 1,
  },
  contentContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  vaseImage: {
    width: '100%',
    height: '100%',
  },
});
