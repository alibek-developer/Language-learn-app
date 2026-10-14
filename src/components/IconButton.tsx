/**
 * ReadScribe Minimal Icon Button
 * Clean circular interactive icon button.
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle, View } from 'react-native';
import { Colors } from '../theme';
import { Icon, IconName } from './Icon';

interface IconButtonProps {
  name: IconName;
  onPress: () => void;
  size?: number;
  buttonSize?: number;
  variant?: 'surface' | 'dark' | 'ghost' | 'muted';
  color?: string;
  style?: StyleProp<ViewStyle>;
  badge?: boolean;
  disabled?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  name,
  onPress,
  size = 18,
  buttonSize = 36,
  variant = 'surface',
  color,
  style,
  badge = false,
  disabled = false,
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'dark':
        return Colors.ink;
      case 'muted':
        return Colors.canvasMuted;
      case 'ghost':
        return Colors.transparent;
      case 'surface':
      default:
        return Colors.surface;
    }
  };

  const getIconColor = () => {
    if (color) return color;
    switch (variant) {
      case 'dark':
        return Colors.white;
      case 'ghost':
      case 'muted':
        return Colors.inkSecondary;
      case 'surface':
      default:
        return Colors.ink;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
          backgroundColor: getBackgroundColor(),
        },
        variant === 'surface' && styles.surfaceBorder,
        style,
      ]}
    >
      <Icon name={name} size={size} color={getIconColor()} />
      {badge ? <View style={styles.badgeDot} /> : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  surfaceBorder: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
});
