/**
 * ReadScribe Monolithic Design System
 * 100% Minimalist, editorial typography, zero-clutter, RedMi 15 5G screen-fitted.
 * Monochromatic elegance with subtle warm amber accents.
 */

import { Platform, StatusBar } from 'react-native';

export const Colors = {
  // Pure Canvas & Surfaces
  canvas: '#FBFBFA',          // Warm editorial paper white
  canvasMuted: '#F4F4F0',     // Subtle surface contrast
  surface: '#FFFFFF',          // Card/Sheet base
  surfaceElevated: '#FFFFFF',

  // Deep Obsidian Ink & Monochromes
  ink: '#121212',             // Primary text & core actions
  inkSecondary: '#5A5A58',    // Body & secondary details
  inkTertiary: '#8E8E8A',     // Metadata & timestamps
  inkMuted: '#BCBCB8',        // Placeholders & inactive states

  // Borders & Dividers (Hairline, ultra-clean)
  border: '#E8E8E4',
  borderSubtle: '#F0F0EC',

  // Sole Warm Accent (Amber / Caramel / Flame)
  accent: '#E26D5C',          // Warm editorial coral/amber
  accentSoft: '#FBF0EE',      // Pale accent pill
  accentBorder: '#F4D2CD',

  // Semantic
  success: '#2B8A3E',
  successSoft: '#EBFBEE',
  danger: '#C92A2A',
  dangerSoft: '#FFF5F5',

  // Pure Constants
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Reader Modes (Paper, Sepia, Night, OLED)
  reader: {
    light: { bg: '#FBFBFA', text: '#141414', card: '#F4F4F0', border: '#E8E8E4' },
    sepia: { bg: '#F8F1E5', text: '#2E261B', card: '#EFE6D5', border: '#E2D6C0' },
    dark:  { bg: '#121214', text: '#EDEDEB', card: '#1C1C1F', border: '#2A2A2E' },
    night: { bg: '#000000', text: '#E0E0DE', card: '#111111', border: '#1F1F1F' },
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  // RedMi 15 5G top & bottom safe paddings
  screenPaddingHorizontal: 20,
  topSafePadding: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 12 : 52,
  bottomNavHeight: 64,
  bottomSafePadding: Platform.OS === 'android' ? 16 : 28,
} as const;

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const LineHeight = {
  tight: 1.25,
  normal: 1.5,
  reading: 1.8,
} as const;

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  hairline: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  floating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
} as const;

// Animated / Bright Theme Tokens (matching HomeScreen)
export const C = {
  bg: '#F5F2FF',
  canvas: '#FFFFFF',
  canvasMuted: '#EDE9FE',
  surface: '#FFFFFF',
  ink: '#1D1147',
  inkSoft: '#6B6390',
  blue: '#3D5AFE',
  violet: '#7C4DFF',
  yellow: '#FFC93C',
  pink: '#FF6F9C',
  mint: '#1FD1A5',
  white: '#FFFFFF',
  track: '#E4DEFA',
  border: '#EDE8F8',
  borderSubtle: '#F4F1FD',
};

export const F = {
  display: 'BricolageGrotesque_800ExtraBold',
  displayMd: 'BricolageGrotesque_700Bold',
  body: 'Figtree_500Medium',
  bodySemi: 'Figtree_600SemiBold',
  bodyBold: 'Figtree_700Bold',
};
