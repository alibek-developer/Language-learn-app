import React from 'react';
import {
  View,
  Text,
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
import { Ionicons } from '@expo/vector-icons';
import { C, F } from '../theme';

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
  { key: 'home', label: 'Bosh', activeIcon: 'home', inactiveIcon: 'home' },
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
    scale.value = withSpring(0.9, { damping: 12, stiffness: 350 });
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
      <Ionicons
        name={active ? item.activeIcon : item.inactiveIcon}
        size={20}
        color={active ? '#FFFFFF' : C.blue}
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
      <View style={styles.dock}>
        {NAV_ITEMS.map((item) => (
          <TabButton
            key={item.key}
            item={item}
            active={currentTab === item.key}
            onPress={() => onTabChange(item.key)}
          />
        ))}
      </View>
    </View>
  );
};

export default BottomNavBar;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 4,
    // Modern floating soft shadow
    shadowColor: '#120E3D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(235, 230, 252, 0.95)',
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  tabItemActive: {
    backgroundColor: C.blue,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  tabItemInactive: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
  },
  activeLabel: {
    fontSize: 13,
    fontFamily: F.bodyBold,
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
});
