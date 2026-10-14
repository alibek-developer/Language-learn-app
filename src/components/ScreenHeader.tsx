/**
 * ReadScribe Minimalist Screen Header
 * Clean editorial header with proper RedMi 15 / Android status bar padding.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme';
import { Icon, IconName } from './Icon';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: {
    icon: IconName;
    label?: string;
    onPress: () => void;
  };
  eyebrow?: string;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
  eyebrow,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.leftContainer}>
          {onBack ? (
            <TouchableOpacity
              onPress={onBack}
              activeOpacity={0.7}
              style={styles.backButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Icon name="arrow-left" size={20} color={Colors.ink} />
            </TouchableOpacity>
          ) : null}

          <View style={styles.titleColumn}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text> : null}
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>
        </View>

        {rightAction ? (
          <TouchableOpacity
            onPress={rightAction.onPress}
            activeOpacity={0.7}
            style={styles.rightActionButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {rightAction.label ? (
              <Text style={styles.rightActionLabel}>{rightAction.label}</Text>
            ) : null}
            <Icon name={rightAction.icon} size={19} color={Colors.ink} />
          </TouchableOpacity>
        ) : null}
      </View>

      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.topSafePadding,
    paddingHorizontal: Spacing.screenPaddingHorizontal,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.canvas,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 38,
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: Spacing.md,
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.canvasMuted,
  },
  titleColumn: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.inkSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  rightActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.canvasMuted,
    gap: 6,
  },
  rightActionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.ink,
  },
});
