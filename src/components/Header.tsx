/**
 * ReadScribe Top Header (Legacy compatibility)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize } from '../theme';
import { useApp } from '../context/AppContext';
import { Icon } from './Icon';
import { IconButton } from './IconButton';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showProfileSummary?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showProfileSummary = true,
  onBackPress,
  rightAction,
}) => {
  const { profile } = useApp();

  return (
    <View style={styles.container}>
      {showProfileSummary ? (
        <View style={styles.topRow}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View>
              <Text style={styles.greeting}>Xayrli kun</Text>
              <Text style={styles.userName}>{profile.name}</Text>
            </View>
          </View>

          <View style={styles.streakBadge}>
            <Icon name="streak" size={14} color={Colors.accent} />
            <Text style={styles.streakCount}>{profile.streakDays} kun</Text>
          </View>
        </View>
      ) : (
        <View style={styles.customTitleRow}>
          {onBackPress ? (
            <IconButton name="arrow-left" buttonSize={36} size={18} onPress={onBackPress} />
          ) : null}
          <View style={styles.titleCenter}>
            <Text style={styles.pageTitle}>{title}</Text>
            {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
          </View>
          {rightAction || <View style={{ width: 36 }} />}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.screenPaddingHorizontal,
    paddingTop: Spacing.topSafePadding,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.canvas,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  greeting: {
    fontSize: 10,
    color: Colors.inkTertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.ink,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentSoft,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  streakCount: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.accent,
  },
  customTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleCenter: {
    flex: 1,
  },
  pageTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.ink,
  },
  pageSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.inkSecondary,
    marginTop: 2,
  },
});
