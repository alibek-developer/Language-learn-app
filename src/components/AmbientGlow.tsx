/**
 * ReadScribe Ambient Glow
 * Atmospheric warm sunset glow from Scribblish & Comu references.
 */

import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface AmbientGlowProps {
  top?: number;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export const AmbientGlow: React.FC<AmbientGlowProps> = ({
  top = 180,
  size = Math.min(width * 0.85, 320),
  style,
}) => {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        {
          top: top - size / 2,
          left: (width - size) / 2,
          width: size,
          height: size * 0.75,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={[
          'rgba(255, 110, 60, 0.38)',
          'rgba(255, 168, 80, 0.26)',
          'rgba(255, 215, 110, 0.12)',
          'rgba(255, 255, 255, 0)',
        ]}
        start={{ x: 0.5, y: 0.2 }}
        end={{ x: 0.5, y: 1.0 }}
        style={styles.innerGlow}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  innerGlow: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    transform: [{ scaleX: 1.15 }],
  },
});
