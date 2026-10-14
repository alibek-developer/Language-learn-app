/**
 * ReadScribe Scribble Doodle
 * Minimal playful doodle squiggles featured in Scribblish designs.
 */

import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors } from '../theme';

interface ScribbleDoodleProps {
  color?: string;
  width?: number;
  style?: StyleProp<ViewStyle>;
  type?: 'wave' | 'loop' | 'accent';
}

export const ScribbleDoodle: React.FC<ScribbleDoodleProps> = ({
  color = Colors.ink,
  width = 36,
  style,
  type = 'wave',
}) => {
  return (
    <View style={[styles.container, { width }, style]}>
      {type === 'wave' ? (
        <View style={styles.waveRow}>
          <View style={[styles.waveArcUp, { borderColor: color }]} />
          <View style={[styles.waveArcDown, { borderColor: color }]} />
          <View style={[styles.waveArcUp, { borderColor: color }]} />
          <View style={[styles.waveArcDown, { borderColor: color }]} />
        </View>
      ) : type === 'loop' ? (
        <View style={styles.loopRow}>
          <View style={[styles.loopDot, { backgroundColor: color }]} />
          <View style={[styles.loopBar, { backgroundColor: color }]} />
          <View style={[styles.loopDot, { backgroundColor: color }]} />
        </View>
      ) : (
        <View style={[styles.accentLine, { backgroundColor: color }]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waveArcUp: {
    width: 8,
    height: 6,
    borderTopWidth: 2.2,
    borderLeftWidth: 1.5,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    marginRight: 1,
  },
  waveArcDown: {
    width: 8,
    height: 6,
    borderBottomWidth: 2.2,
    borderRightWidth: 1.5,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    marginRight: 1,
  },
  loopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  loopDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  loopBar: {
    width: 18,
    height: 2.5,
    borderRadius: 2,
  },
  accentLine: {
    width: 24,
    height: 3,
    borderRadius: 2,
  },
});
