import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { F } from '../theme';

export type TabKey = 'home' | 'reading' | 'vocab' | 'writing' | 'profile';

export interface BottomNavBarProps {
  currentTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

interface NavItem {
  key: TabKey;
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: 'Bosh', activeIcon: 'home', inactiveIcon: 'home-outline' },
  { key: 'reading', label: 'Mutolaa', activeIcon: 'book', inactiveIcon: 'book-outline' },
  { key: 'vocab', label: "Lug‘at", activeIcon: 'albums', inactiveIcon: 'albums-outline' },
  { key: 'writing', label: 'Yozish', activeIcon: 'create', inactiveIcon: 'create-outline' },
  { key: 'profile', label: 'Profil', activeIcon: 'person', inactiveIcon: 'person-outline' },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TabButton: React.FC<{
  item: NavItem;
  active: boolean;
  onPress: () => void;
}> = ({ item, active, onPress }) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.91, { damping: 12, stiffness: 350 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 9, stiffness: 220 });
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      layout={LinearTransition.springify().damping(16).stiffness(220)}
      style={[
        styles.tabItem,
        active ? styles.tabItemActive : styles.tabItemInactive,
        animStyle,
      ]}
      hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
    >
      {active && (
        <LinearGradient
          colors={['#5372FF', '#3D5AFE', '#2B42D9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      {active && (
        <View style={styles.liquidGlossHighlight} pointerEvents="none" />
      )}
      <Ionicons
        name={active ? item.activeIcon : item.inactiveIcon}
        size={23}
        color={active ? '#FFFFFF' : '#2D206B'}
      />
      {active && (
        <Animated.Text
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(90)}
          style={styles.activeLabel}
          numberOfLines={1}
        >
          {item.label}
        </Animated.Text>
      )}
    </AnimatedPressable>
  );
};

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onTabChange,
}) => {
  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.dockShadow}>
        {/* Real blur backdrop */}
        <BlurView
          intensity={Platform.OS === 'ios' ? 55 : 65}
          tint="light"
          blurMethod="dimezisBlurView"
          style={styles.blurContainer}
        >
          {/* Mostly opaque white overlay — Telegram style */}
          <View style={styles.glassOverlay} pointerEvents="none" />

          {/* Thin top highlight line */}
          <View style={styles.specularReflex} pointerEvents="none" />

          {/* Nav Items */}
          <View style={styles.dockRow}>
            {NAV_ITEMS.map((item) => (
              <TabButton
                key={item.key}
                item={item}
                active={currentTab === item.key}
                onPress={() => onTabChange(item.key)}
              />
            ))}
          </View>
        </BlurView>
      </View>
    </View>
  );
};

export default BottomNavBar;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 26 : 18,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  dockShadow: {
    borderRadius: 48,
    shadowColor: '#160840',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 18,
    elevation: 14,
  },
  blurContainer: {
    borderRadius: 48,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderTopColor: '#FFFFFF',
    borderBottomColor: 'rgba(220, 210, 250, 0.5)',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
  },
  dockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 9,
    gap: 6,
  },
  specularReflex: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 1,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemActive: {
    borderRadius: 32,
    paddingVertical: 12,
    paddingHorizontal: 18,
    gap: 7,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    borderTopColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#3D5AFE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.42,
    shadowRadius: 10,
    elevation: 6,
  },
  liquidGlossHighlight: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: '44%',
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  tabItemInactive: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeLabel: {
    fontSize: 14,
    fontFamily: F.bodyBold,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
