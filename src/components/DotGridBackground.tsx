/**
 * ReadScribe Dot Grid Background (Minimalist)
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, StyleProp, ViewStyle } from 'react-native';
import { Colors } from '../theme';

const { width, height } = Dimensions.get('window');

interface DotGridBackgroundProps {
  style?: StyleProp<ViewStyle>;
  spacing?: number;
  dotSize?: number;
}

export const DotGridBackground: React.FC<DotGridBackgroundProps> = ({
  style,
  spacing = 28,
  dotSize = 2,
}) => {
  const { cols, rows } = useMemo(() => {
    const colsCount = Math.floor(width / spacing);
    const rowsCount = Math.floor((height * 1.2) / spacing);
    return {
      cols: Array.from({ length: colsCount }, (_, i) => i),
      rows: Array.from({ length: rowsCount }, (_, i) => i),
    };
  }, [spacing]);

  return (
    <View pointerEvents="none" style={[styles.container, style]}>
      {rows.map((r) => (
        <View key={`r-${r}`} style={[styles.row, { height: spacing }]}>
          {cols.map((c) => (
            <View
              key={`c-${c}`}
              style={[
                styles.dot,
                {
                  width: dotSize,
                  height: dotSize,
                  borderRadius: dotSize / 2,
                  marginLeft: spacing - dotSize,
                },
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    zIndex: 0,
    opacity: 0.15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    backgroundColor: Colors.inkTertiary,
  },
});
