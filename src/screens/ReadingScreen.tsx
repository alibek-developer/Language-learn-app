// ReadingScreen.tsx — Mutolaa: kutubxona + o‘qish rejimi (atmosferalar bilan)
// HomeScreen/WritingScreen bilan bir xil dizayn tizimi

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  Pressable,
  StatusBar,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Clipboard from 'expo-clipboard';
import Animated, {
  SharedValue,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  interpolate,
  Easing,
  FadeIn,
  FadeOut,
  FadeInDown,
  ZoomIn,
  SlideInRight,
  SlideOutRight,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { useFonts } from 'expo-font';
import {
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import {
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
} from '@expo-google-fonts/figtree';
import { Lora_400Regular } from '@expo-google-fonts/lora';
import { Lexend_400Regular } from '@expo-google-fonts/lexend';

import { useApp } from '../context/AppContext';
import { findDictionaryEntry } from '../data/dictionary';

// ─── Tokens ──────────────────────────────────────────────
const C = {
  bg: '#F5F2FF',
  ink: '#1D1147',
  inkSoft: '#6B6390',
  blue: '#3D5AFE',
  violet: '#7C4DFF',
  yellow: '#FFC93C',
  pink: '#FF6F9C',
  mint: '#1FD1A5',
  white: '#FFFFFF',
  track: '#E4DEFA',
};

const F = {
  display: 'BricolageGrotesque_800ExtraBold',
  displayMd: 'BricolageGrotesque_700Bold',
  body: 'Figtree_500Medium',
  bodySemi: 'Figtree_600SemiBold',
  bodyBold: 'Figtree_700Bold',
  serif: 'Lora_400Regular',
  sans: 'Lexend_400Regular',
};

// ─── Atmosferalar ────────────────────────────────────────
export interface ThemeConfig {
  id: string;
  name: string;
  emoji: string;
  dark: boolean;
  bg: string;
  text: string;
  soft: string;
  accent: string;
  onAccent: string;
  surface: string;
  line: string;
}

const THEMES: Record<string, ThemeConfig> = {
  paper: {
    id: 'paper', name: 'Qog‘oz', emoji: '📜', dark: false,
    bg: '#F6EEDC', text: '#2E2418', soft: '#8A7A62', accent: '#E8590C',
    onAccent: '#FFFFFF', surface: '#FFFBF1', line: 'rgba(46,36,24,0.14)',
  },
  night: {
    id: 'night', name: 'Tun', emoji: '🌙', dark: true,
    bg: '#000000', text: '#DAD7E6', soft: '#8D8AA3', accent: '#B9A8FF',
    onAccent: '#1D1147', surface: '#15151C', line: 'rgba(255,255,255,0.16)',
  },
  forest: {
    id: 'forest', name: 'O‘rmon', emoji: '🌲', dark: true,
    bg: '#0E2A1F', text: '#E4F2E8', soft: '#8FB3A0', accent: '#7BE0A4',
    onAccent: '#0E2A1F', surface: '#16392B', line: 'rgba(255,255,255,0.16)',
  },
  rain: {
    id: 'rain', name: 'Yomg‘ir', emoji: '🌧️', dark: true,
    bg: '#1A2430', text: '#DCE6F0', soft: '#8DA2B8', accent: '#7FB8FF',
    onAccent: '#10202F', surface: '#243344', line: 'rgba(255,255,255,0.16)',
  },
  sea: {
    id: 'sea', name: 'Dengiz', emoji: '🌊', dark: false,
    bg: '#DDF3F2', text: '#12343B', soft: '#5E8A90', accent: '#0E9AA7',
    onAccent: '#FFFFFF', surface: '#F4FFFE', line: 'rgba(18,52,59,0.14)',
  },
};
const THEME_LIST = Object.values(THEMES);

// ─── Mock data ───────────────────────────────────────────
const DICT: Record<string, { ipa: string; pos: string; uz: string }> = {
  lighthouse: { ipa: '/ˈlaɪthaʊs/', pos: 'ot', uz: 'mayoq' },
  lamp: { ipa: '/læmp/', pos: 'ot', uz: 'chiroq' },
  stairs: { ipa: '/steəz/', pos: 'ot', uz: 'zinapoya' },
  tired: { ipa: '/ˈtaɪəd/', pos: 'sifat', uz: 'charchagan' },
  stormy: { ipa: '/ˈstɔːmi/', pos: 'sifat', uz: 'bo‘ronli' },
  harbor: { ipa: '/ˈhɑːbə/', pos: 'ot', uz: 'port, bandargoh' },
  sailors: { ipa: '/ˈseɪləz/', pos: 'ot', uz: 'dengizchilar' },
  rocks: { ipa: '/rɒks/', pos: 'ot', uz: 'toshlar, qoyalar' },
  waves: { ipa: '/weɪvz/', pos: 'ot', uz: 'to‘lqinlar' },
  suddenly: { ipa: '/ˈsʌdənli/', pos: 'ravish', uz: 'birdan' },
  noticed: { ipa: '/ˈnəʊtɪst/', pos: 'fe‘l', uz: 'payqadi' },
  keeper: { ipa: '/ˈkiːpə/', pos: 'ot', uz: 'qo‘riqchi, saqlovchi' },
  villagers: { ipa: '/ˈvɪlɪdʒəz/', pos: 'ot', uz: 'qishloq aholisi' },
  daily: { ipa: '/ˈdeɪli/', pos: 'sifat', uz: 'kundalik' },
  debate: { ipa: '/dɪˈbeɪt/', pos: 'fe‘l', uz: 'bahslashmoq' },
  theories: { ipa: '/ˈθɪəriz/', pos: 'ot', uz: 'nazariyalar' },
  memories: { ipa: '/ˈmeməriz/', pos: 'ot', uz: 'xotiralar' },
  rehearsal: { ipa: '/rɪˈhɜːsl/', pos: 'ot', uz: 'repetitsiya, mashq' },
  environment: { ipa: '/ɪnˈvaɪrənmənt/', pos: 'ot', uz: 'muhit' },
  concentrate: { ipa: '/ˈkɒnsntreɪt/', pos: 'fe‘l', uz: 'e‘tibor qaratmoq' },
  essential: { ipa: '/ɪˈsenʃl/', pos: 'sifat', uz: 'juda zarur' },
  researchers: { ipa: '/rɪˈsɜːtʃəz/', pos: 'ot', uz: 'tadqiqotchilar' },
  squirrel: { ipa: '/ˈskwɪrəl/', pos: 'ot', uz: 'olmaxon' },
  bench: { ipa: '/bentʃ/', pos: 'ot', uz: 'skameyka' },
  path: { ipa: '/pɑːθ/', pos: 'ot', uz: 'yo‘lak, so‘qmoq' },
  colorful: { ipa: '/ˈkʌləfl/', pos: 'sifat', uz: 'rang-barang' },
  leaves: { ipa: '/liːvz/', pos: 'ot', uz: 'barglar' },
  covered: { ipa: '/ˈkʌvəd/', pos: 'sifat', uz: 'qoplangan' },
};

const getDictEntry = (w: string) => {
  if (DICT[w]) return DICT[w];
  const found = findDictionaryEntry(w);
  if (found) {
    return {
      ipa: found.phonetic,
      pos: found.partOfSpeech,
      uz: found.translationUz,
    };
  }
  return null;
};

export interface ParaItem {
  en: string;
  uz: string | null;
}

export interface ReadingArticle {
  id: string | number;
  title: string;
  level: string;
  minutes: number;
  emoji: string;
  color: string;
  fg: string;
  paras: ParaItem[];
}

const MOCK_TEXTS: ReadingArticle[] = [
  {
    id: 1,
    title: 'The Lighthouse Keeper',
    level: 'B1',
    minutes: 3,
    emoji: '🗼',
    color: C.blue,
    fg: C.white,
    paras: [
      {
        en: 'At the edge of a small village, there was an old lighthouse. Every evening, an old man named Tom climbed the stairs to light its lamp. He had done this for forty years, and he never felt tired of it.',
        uz: 'Kichik qishloq chekkasida eski mayoq bor edi. Har oqshom Tom ismli chol uning chirog‘ini yoqish uchun zinapoyadan chiqardi. U buni qirq yil davomida qilgan va hech qachon charchamagan.',
      },
      {
        en: 'One stormy night, a fishing boat lost its way in the dark. The sailors could not see the rocks, and the waves were growing stronger. Suddenly, they noticed a bright light far away and turned the boat towards it.',
        uz: 'Bir bo‘ronli kechada baliqchi qayig‘i qorong‘uda yo‘ldan adashdi. Dengizchilar toshlarni ko‘ra olmasdi, to‘lqinlar esa kuchayib borardi. Birdan ular uzoqda yorqin nurni payqab, qayiqni o‘sha tomonga burishdi.',
      },
      {
        en: 'When the boat reached the harbor, the sailors ran to thank the keeper. Tom only smiled and said, "I did not save you. I only kept the light on." From that day, the villagers understood how important small, daily work can be.',
        uz: 'Qayiq portga yetib kelganda dengizchilar mayoqchiga minnatdorchilik bildirgani yugurishdi. Tom faqat jilmaydi: "Men sizni qutqarmadim. Men shunchaki chiroqni yoqib qo‘ydim." O‘sha kundan boshlab qishloq aholisi kichik kundalik ishning naqadar muhimligini tushundi.',
      },
    ],
  },
  {
    id: 2,
    title: 'Why Do We Dream?',
    level: 'B2',
    minutes: 4,
    emoji: '🌙',
    color: C.violet,
    fg: C.white,
    paras: [
      {
        en: 'Scientists still debate why humans dream, but several theories have gained attention. One idea suggests that dreams help the brain sort through memories, keeping what matters and letting go of the rest.',
        uz: 'Olimlar odamlar nega tush ko‘rishi haqida hamon bahslashadi, biroq bir nechta nazariya e‘tibor qozondi. Bir g‘oyaga ko‘ra, tushlar miyaga xotiralarni saralashga yordam beradi: muhimini saqlab, qolganini unutishga.',
      },
      {
        en: 'Another theory argues that dreaming works like a rehearsal. In a safe environment, the mind practices reacting to difficult situations, which may explain why many dreams involve fear or surprise.',
        uz: 'Boshqa nazariyaga ko‘ra, tush ko‘rish repetitsiya kabi ishlaydi. Xavfsiz muhitda aql qiyin vaziyatlarga munosabat bildirishni mashq qiladi, shuning uchun ko‘p tushlarda qo‘rquv yoki kutilmagan holatlar uchraydi.',
      },
      {
        en: 'Whatever the reason, researchers agree that good sleep is essential. People who sleep well tend to concentrate better, remember more, and feel calmer throughout the day.',
        uz: 'Sabab qanday bo‘lmasin, tadqiqotchilar yaxshi uyqu juda muhimligiga rozi. Yaxshi uxlaydigan odamlar yaxshiroq e‘tibor qaratadi, ko‘proq eslab qoladi va kun bo‘yi xotirjamroq his qiladi.',
      },
    ],
  },
  {
    id: 3,
    title: 'A Walk in the Autumn Park',
    level: 'A2',
    minutes: 2,
    emoji: '🍂',
    color: C.yellow,
    fg: C.ink,
    paras: [
      {
        en: 'Yesterday I went to the park after school. The trees were red, yellow, and orange. The air was cool, and the ground was covered with colorful leaves.',
        uz: 'Kecha maktabdan keyin parkka bordim. Daraxtlar qizil, sariq va to‘q sariq edi. Havo salqin, yer esa rang-barang barglar bilan qoplangan edi.',
      },
      {
        en: 'I sat on a bench and read my book for an hour. A little squirrel ran across the path and climbed a tree. I smiled and took a photo of it.',
        uz: 'Men skameykada o‘tirib, bir soat kitob o‘qidim. Kichik olmaxon yo‘l bo‘ylab yugurib, daraxtga chiqib ketdi. Men jilmayib, uning suratini oldim.',
      },
    ],
  },
];

// ─── Yordamchilar ────────────────────────────────────────
const rnd = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};
const splitSentences = (text: string) =>
  text.match(/[^.!?]+[.!?]+["'’”)\]]*\s*|[^.!?]+$/g) || [text];
const normWord = (t: string) => t.replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, '').toLowerCase();

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function Tap({
  children,
  style,
  onPress,
  tilt = 0,
}: {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
  tilt?: number;
}) {
  const scale = useSharedValue(1);
  const rot = useSharedValue(0);
  const a = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rot.value}deg` }],
  }));
  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.94, { damping: 12, stiffness: 320 });
        rot.value = withSpring(tilt, { damping: 12, stiffness: 200 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 7, stiffness: 180 });
        rot.value = withSpring(0, { damping: 8, stiffness: 180 });
      }}
      onPress={onPress}
      style={[style, a]}
    >
      {children}
    </AnimatedPressable>
  );
}

function Blob({
  color,
  size,
  top,
  left,
  right,
  delay = 0,
  drift = 16,
  opacity = 0.3,
}: {
  color: string;
  size: number;
  top?: number;
  left?: number;
  right?: number;
  delay?: number;
  drift?: number;
  opacity?: number;
}) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 5200, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
  }, []);
  const a = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(t.value, [0, 1], [-drift, drift]) },
      { translateX: interpolate(t.value, [0, 1], [drift / 2, -drift / 2]) },
      { scale: interpolate(t.value, [0, 1], [1, 1.12]) },
    ],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity,
          top,
          left,
          right,
        },
        a,
      ]}
    />
  );
}

function Wiggle({ emoji }: { emoji: string }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 600, easing: Easing.inOut(Easing.quad) }),
        withDelay(1100, withTiming(0, { duration: 1 }))
      ),
      -1
    );
  }, []);
  const a = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(t.value, [0, 1], [0, -6]) },
      { rotate: `${interpolate(t.value, [0, 1], [-10, 10])}deg` },
    ],
  }));
  return <Animated.Text style={[{ fontSize: 32 }, a]}>{emoji}</Animated.Text>;
}

function MiniBar({ value, color, track }: { value: number; color: string; track: string }) {
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withDelay(
      700,
      withTiming(Math.min(value / 100, 1), { duration: 900, easing: Easing.out(Easing.cubic) })
    );
  }, [value]);
  const a = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View style={[s.miniTrack, { backgroundColor: track }]}>
      <Animated.View style={[s.miniFill, { backgroundColor: color }, a]} />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════
//  ATMOSFERA EFFEKTLARI (o‘qish fonida)
// ═══════════════════════════════════════════════════════════

function Twinkle({
  x,
  y,
  size,
  delay,
  dur,
}: {
  x: number;
  y: number;
  size: number;
  delay: number;
  dur: number;
}) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: dur, easing: Easing.inOut(Easing.sin) }), -1, true)
    );
  }, []);
  const a = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 1], [0.12, 0.95]),
    transform: [{ scale: interpolate(t.value, [0, 1], [0.7, 1.25]) }],
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#FFFFFF',
        },
        a,
      ]}
    />
  );
}

function Moon() {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);
  const a = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(t.value, [0, 1], [0, 8]) }],
  }));
  return (
    <Animated.Text style={[{ position: 'absolute', top: 70, right: 22, fontSize: 36, opacity: 0.9 }, a]}>
      🌙
    </Animated.Text>
  );
}

function Stars() {
  const { width, height } = useWindowDimensions();
  const stars = useMemo(
    () =>
      Array.from({ length: 32 }, (_, i) => ({
        x: rnd(i + 1) * width,
        y: rnd(i + 40) * height * 0.92,
        size: 2 + rnd(i + 80) * 3,
        delay: rnd(i + 120) * 2000,
        dur: 1200 + rnd(i + 160) * 2200,
      })),
    [width, height]
  );
  return (
    <>
      {stars.map((st, i) => (
        <Twinkle key={i} {...st} />
      ))}
      <Moon />
    </>
  );
}

function Firefly({
  x,
  y,
  delay,
  dur,
}: {
  x: number;
  y: number;
  delay: number;
  dur: number;
}) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: dur, easing: Easing.inOut(Easing.sin) }), -1, true)
    );
  }, []);
  const a = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 1], [0.2, 1]),
    transform: [
      { translateY: interpolate(t.value, [0, 1], [0, -70]) },
      { translateX: interpolate(t.value, [0, 1], [-16, 16]) },
    ],
  }));
  return (
    <Animated.View
      style={[
        { position: 'absolute', left: x, top: y, width: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
        a,
      ]}
    >
      <View
        style={{
          position: 'absolute',
          width: 14,
          height: 14,
          borderRadius: 7,
          backgroundColor: '#C8FF8A',
          opacity: 0.25,
          transform: [{ scale: 2.4 }],
        }}
      />
      <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#E6FFB0' }} />
    </Animated.View>
  );
}

function Leaf({
  x,
  delay,
  dur,
}: {
  x: number;
  delay: number;
  dur: number;
}) {
  const { height } = useWindowDimensions();
  const fall = useSharedValue(0);
  const sway = useSharedValue(0);
  useEffect(() => {
    fall.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: dur, easing: Easing.linear }), -1)
    );
    sway.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);
  const a = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(fall.value, [0, 1], [-40, height + 40]) },
      { translateX: interpolate(sway.value, [0, 1], [-24, 24]) },
      { rotate: `${interpolate(sway.value, [0, 1], [-40, 40])}deg` },
    ],
    opacity: 0.8,
  }));
  return <Animated.Text style={[{ position: 'absolute', left: x, top: 0, fontSize: 20 }, a]}>🍃</Animated.Text>;
}

function Forest() {
  const { width, height } = useWindowDimensions();
  const flies = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        x: rnd(i + 5) * width,
        y: height * 0.25 + rnd(i + 25) * height * 0.7,
        delay: rnd(i + 45) * 2500,
        dur: 2800 + rnd(i + 65) * 2600,
      })),
    [width, height]
  );
  const leaves = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        x: rnd(i + 200) * (width - 30),
        delay: i * 1800,
        dur: 11000 + rnd(i + 300) * 5000,
      })),
    [width]
  );
  return (
    <>
      {flies.map((f, i) => (
        <Firefly key={`f${i}`} {...f} />
      ))}
      {leaves.map((l, i) => (
        <Leaf key={`l${i}`} {...l} />
      ))}
    </>
  );
}

function Drop({
  x,
  delay,
  dur,
  len,
}: {
  x: number;
  delay: number;
  dur: number;
  len: number;
}) {
  const { height } = useWindowDimensions();
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: dur, easing: Easing.linear }), -1)
    );
  }, []);
  const a = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(t.value, [0, 1], [-60, height + 20]) },
      { translateX: interpolate(t.value, [0, 1], [0, -40]) },
      { rotate: '12deg' },
    ],
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x,
          top: 0,
          width: 1.5,
          height: len,
          borderRadius: 1,
          backgroundColor: 'rgba(190,220,255,0.45)',
        },
        a,
      ]}
    />
  );
}

function Rain() {
  const { width } = useWindowDimensions();
  const drops = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        x: rnd(i + 7) * (width + 60),
        delay: rnd(i + 70) * 1800,
        dur: 900 + rnd(i + 140) * 800,
        len: 16 + rnd(i + 210) * 16,
      })),
    [width]
  );
  return (
    <>
      {drops.map((d, i) => (
        <Drop key={i} {...d} />
      ))}
    </>
  );
}

function WaveLayer({
  color,
  opacity,
  bottom,
  dur,
  dir = 1,
  bobAmp = 10,
  bobDur = 3000,
}: {
  color: string;
  opacity: number;
  bottom: number;
  dur: number;
  dir?: number;
  bobAmp?: number;
  bobDur?: number;
}) {
  const { width } = useWindowDimensions();
  const size = 150;
  const spacing = 110;
  const t = useSharedValue(0);
  const b = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: dur, easing: Easing.linear }), -1);
    b.value = withRepeat(
      withTiming(1, { duration: bobDur, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);
  const count = Math.ceil(width / spacing) + 4;
  const a = useAnimatedStyle(() => ({
    transform: [
      { translateX: dir * interpolate(t.value, [0, 1], [0, -spacing]) },
      { translateY: interpolate(b.value, [0, 1], [0, -bobAmp]) },
    ],
  }));
  return (
    <Animated.View
      needsOffscreenAlphaCompositing
      style={[{ position: 'absolute', left: 0, bottom, height: size, width, opacity }, a]}
    >
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: i * spacing - spacing * 2,
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          }}
        />
      ))}
    </Animated.View>
  );
}

function Sea() {
  return (
    <>
      <WaveLayer color="#7ED6D9" opacity={0.45} bottom={-95} dur={7000} dir={1} bobAmp={12} bobDur={3200} />
      <WaveLayer color="#0E9AA7" opacity={0.28} bottom={-105} dur={9500} dir={-1} bobAmp={9} bobDur={4100} />
    </>
  );
}

function Ambient({ id }: { id: string }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {id === 'paper' && (
        <>
          <Blob color="#FFC93C" size={240} top={-80} right={-100} opacity={0.28} />
          <Blob color="#FF9F6B" size={200} top={420} left={-110} delay={1200} opacity={0.2} />
        </>
      )}
      {id === 'night' && <Stars />}
      {id === 'forest' && <Forest />}
      {id === 'rain' && <Rain />}
      {id === 'sea' && <Sea />}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════
//  O‘QISH REJIMI
// ═══════════════════════════════════════════════════════════

function Toggle({
  on,
  onChange,
  th,
}: {
  on: boolean;
  onChange: (val: boolean) => void;
  th: ThemeConfig;
}) {
  const x = useSharedValue(on ? 1 : 0);
  useEffect(() => {
    x.value = withSpring(on ? 1 : 0, { damping: 14, stiffness: 220 });
  }, [on]);
  const knob = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(x.value, [0, 1], [2, 22]) }],
  }));
  return (
    <Pressable onPress={() => onChange(!on)} hitSlop={8}>
      <View
        style={[
          s.toggleTrack,
          { backgroundColor: on ? th.accent : th.dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.16)' },
        ]}
      >
        <Animated.View style={[s.toggleKnob, knob]} />
      </View>
    </Pressable>
  );
}

function IconBtn({
  icon,
  onPress,
  th,
  active,
  size = 40,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  th: ThemeConfig;
  active?: boolean;
  size?: number;
}) {
  return (
    <Tap
      onPress={onPress}
      style={[
        { width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' },
        active && { backgroundColor: th.accent + '33' },
      ]}
    >
      <Ionicons name={icon} size={21} color={active ? th.accent : th.text} />
    </Tap>
  );
}

function PlayRing({ th }: { th: ThemeConfig }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 1300, easing: Easing.out(Easing.quad) }), -1);
  }, []);
  const a = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 1], [0.45, 0]),
    transform: [{ scale: interpolate(t.value, [0, 1], [1, 1.55]) }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { borderRadius: 26, backgroundColor: th.accent }, a]}
    />
  );
}

function Particle({
  p,
  pt,
}: {
  p: SharedValue<number>;
  pt: { a: number; d: number; c: string; sz: number; r: number };
}) {
  const a = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0, 0.05, 0.7, 1], [0, 1, 1, 0]),
    transform: [
      { translateX: Math.cos(pt.a) * pt.d * p.value },
      { translateY: Math.sin(pt.a) * pt.d * p.value + 70 * p.value * p.value },
      { rotate: `${pt.r * p.value}deg` },
    ],
  }));
  return (
    <Animated.View
      style={[
        { position: 'absolute', width: pt.sz, height: pt.sz * 0.6, borderRadius: 2, backgroundColor: pt.c },
        a,
      ]}
    />
  );
}

function Confetti({ burst }: { burst: number }) {
  const p = useSharedValue(0);
  const parts = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        a: (i / 24) * Math.PI * 2 + rnd(i) * 0.5,
        d: 70 + rnd(i + 50) * 90,
        c: [C.pink, C.yellow, C.mint, C.violet, C.blue][i % 5],
        sz: 8 + rnd(i + 9) * 8,
        r: rnd(i + 3) * 540,
      })),
    []
  );
  useEffect(() => {
    if (burst > 0) {
      p.value = 0;
      p.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
    }
  }, [burst]);
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
      {parts.map((pt, i) => (
        <Particle key={i} p={p} pt={pt} />
      ))}
    </View>
  );
}

function Paragraph({
  para,
  pi,
  sentences,
  offset,
  th,
  fontFamily,
  size,
  curSent,
  saved,
  hardMode,
  trVisible,
  dim,
  onWord,
  onToggleTr,
  onLayoutY,
}: {
  para: ParaItem;
  pi: number;
  sentences: string[];
  offset: number;
  th: ThemeConfig;
  fontFamily: string;
  size: number;
  curSent: number;
  saved: string[];
  hardMode: boolean;
  trVisible: boolean;
  dim: boolean;
  onWord: (tok: string, pi: number) => void;
  onToggleTr: (pi: number) => void;
  onLayoutY: (pi: number, y: number) => void;
}) {
  const o = useSharedValue(1);
  useEffect(() => {
    o.value = withTiming(dim ? 0.22 : 1, { duration: 300 });
  }, [dim]);
  const dimStyle = useAnimatedStyle(() => ({ opacity: o.value }));

  return (
    <Animated.View
      style={[{ marginBottom: 26 }, dimStyle]}
      onLayout={(e) => onLayoutY(pi, e.nativeEvent.layout.y)}
    >
      <Text
        onLongPress={() => onToggleTr(pi)}
        style={{ fontFamily, fontSize: size, lineHeight: size * 1.7, color: th.text }}
      >
        {sentences.map((sent, si) => {
          const active = offset + si === curSent;
          return (
            <Text
              key={si}
              style={active ? { backgroundColor: th.accent + '30' } : null}
            >
              {sent.split(/(\s+)/).map((tok, ti) => {
                if (tok === '' || /^\s+$/.test(tok)) return tok;
                const w = normWord(tok);
                const isSaved = saved.includes(w);
                const isHard = hardMode && !!getDictEntry(w);
                return (
                  <Text
                    key={ti}
                    onPress={() => onWord(tok, pi)}
                    style={[
                      isSaved && { backgroundColor: th.accent + '45' },
                      isHard && !isSaved && {
                        textDecorationLine: 'underline',
                        textDecorationStyle: 'dotted',
                        textDecorationColor: th.accent,
                      },
                    ]}
                  >
                    {tok}
                  </Text>
                );
              })}
            </Text>
          );
        })}
      </Text>

      {trVisible && (
        <Animated.View
          entering={FadeInDown.duration(220)}
          exiting={FadeOut.duration(120)}
          style={[s.trBox, { borderLeftColor: th.accent }]}
        >
          <Text style={[s.trText, { color: th.soft }]}>
            {para.uz || 'Bu matn uchun tarjima AI ulangandan keyin chiqadi.'}
          </Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

function WordSheet({
  th,
  word,
  isSaved,
  onToggleSave,
  onClose,
}: {
  th: ThemeConfig;
  word: string;
  isSaved: boolean;
  onToggleSave: (w: string) => void;
  onClose: () => void;
}) {
  const entry = getDictEntry(word);
  return (
    <Animated.View
      entering={SlideInDown.springify().damping(17)}
      exiting={SlideOutDown.duration(180)}
      style={[s.sheet, { backgroundColor: th.surface, borderColor: th.line }]}
    >
      <Animated.View key={word} entering={FadeIn.duration(180)}>
        <View style={s.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={[s.wsWord, { color: th.text }]}>{word}</Text>
            {entry && (
              <Text style={[s.wsMeta, { color: th.soft }]}>
                {entry.ipa} · {entry.pos}
              </Text>
            )}
          </View>
          <Tap onPress={onClose} style={s.sheetClose}>
            <Ionicons name="close" size={20} color={th.soft} />
          </Tap>
        </View>

        {entry ? (
          <Text style={[s.wsUz, { color: th.accent }]}>{entry.uz}</Text>
        ) : (
          <Text style={[s.wsNone, { color: th.soft }]}>
            Bu so‘z offline lug‘atda yo‘q. Tez kunda AI orqali to‘liq ma‘nosi chiqadi.
          </Text>
        )}

        <View style={s.wsActions}>
          <Tap
            onPress={() => Speech.speak(word, { language: 'en-US', rate: 1 })}
            style={[s.wsBtn, { backgroundColor: th.accent }]}
          >
            <Ionicons name="volume-high" size={18} color={th.onAccent} />
            <Text style={[s.wsBtnText, { color: th.onAccent }]}>Eshitish</Text>
          </Tap>
          <Tap
            onPress={() => Speech.speak(word, { language: 'en-US', rate: 0.45 })}
            style={[s.wsBtn, { backgroundColor: th.accent + '28' }]}
          >
            <Ionicons name="hourglass" size={17} color={th.accent} />
            <Text style={[s.wsBtnText, { color: th.accent }]}>Sekin</Text>
          </Tap>
          <Tap
            onPress={() => onToggleSave(word)}
            style={[s.wsBtn, { flex: 1, backgroundColor: isSaved ? th.text : th.accent + '28' }]}
          >
            <Ionicons
              name={isSaved ? 'checkmark-circle' : 'star-outline'}
              size={18}
              color={isSaved ? th.surface : th.accent}
            />
            <Text style={[s.wsBtnText, { color: isSaved ? th.surface : th.accent }]} numberOfLines={1}>
              {isSaved ? 'Lug‘atda' : 'Lug‘atga qo‘shish'}
            </Text>
          </Tap>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

function SettingsSheet({
  th,
  onClose,
  fontKey,
  setFontKey,
  size,
  setSize,
  showTr,
  setShowTr,
  hardMode,
  setHardMode,
  focusMode,
  setFocusMode,
}: {
  th: ThemeConfig;
  onClose: () => void;
  fontKey: string;
  setFontKey: (k: string) => void;
  size: number;
  setSize: React.Dispatch<React.SetStateAction<number>>;
  showTr: boolean;
  setShowTr: (v: boolean) => void;
  hardMode: boolean;
  setHardMode: (v: boolean) => void;
  focusMode: boolean;
  setFocusMode: (v: boolean) => void;
}) {
  const Row = ({
    title,
    sub,
    value,
    onChange,
  }: {
    title: string;
    sub: string;
    value: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <View style={[s.rowBetween, { marginTop: 14 }]}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={[s.setLabel, { color: th.text }]}>{title}</Text>
        <Text style={[s.setSub, { color: th.soft }]}>{sub}</Text>
      </View>
      <Toggle on={value} onChange={onChange} th={th} />
    </View>
  );

  return (
    <Animated.View
      entering={SlideInDown.springify().damping(17)}
      exiting={SlideOutDown.duration(180)}
      style={[s.sheet, { backgroundColor: th.surface, borderColor: th.line }]}
    >
      <View style={s.rowBetween}>
        <Text style={[s.sheetTitle, { color: th.text }]}>O‘qish sozlamalari</Text>
        <Tap onPress={onClose} style={s.sheetClose}>
          <Ionicons name="close" size={20} color={th.soft} />
        </Tap>
      </View>

      <View style={[s.rowBetween, { marginTop: 14 }]}>
        <Text style={[s.setLabel, { color: th.text }]}>Shrift</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[
            { k: 'serif', label: 'Kitobiy', f: F.serif },
            { k: 'sans', label: 'Qulay', f: F.sans },
          ].map((o) => (
            <Tap
              key={o.k}
              onPress={() => setFontKey(o.k)}
              style={[
                s.fontChip,
                { borderColor: th.line },
                fontKey === o.k && { backgroundColor: th.accent, borderColor: th.accent },
              ]}
            >
              <Text
                style={{
                  fontFamily: o.f,
                  fontSize: 15,
                  color: fontKey === o.k ? th.onAccent : th.text,
                }}
              >
                {o.label}
              </Text>
            </Tap>
          ))}
        </View>
      </View>

      <View style={[s.rowBetween, { marginTop: 14 }]}>
        <Text style={[s.setLabel, { color: th.text }]}>Harf o‘lchami</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Tap
            onPress={() => setSize((v) => Math.max(15, v - 1))}
            style={[s.sizeBtn, { borderColor: th.line }]}
          >
            <Ionicons name="remove" size={18} color={th.text} />
          </Tap>
          <Text style={[s.sizeVal, { color: th.text }]}>{size}</Text>
          <Tap
            onPress={() => setSize((v) => Math.min(28, v + 1))}
            style={[s.sizeBtn, { borderColor: th.line }]}
          >
            <Ionicons name="add" size={18} color={th.text} />
          </Tap>
        </View>
      </View>

      <Row title="Tarjimani ko‘rsatish" sub="Har abzats tagida o‘zbekcha" value={showTr} onChange={setShowTr} />
      <Row title="Qiyin so‘zlarni belgilash" sub="Lug‘atdagi so‘zlar tagiga chiziladi" value={hardMode} onChange={setHardMode} />
      <Row title="Diqqat rejimi" sub="Faqat joriy abzats yorqin turadi" value={focusMode} onChange={setFocusMode} />
    </Animated.View>
  );
}

function AtmosSheet({
  th,
  themeId,
  onPick,
  onClose,
}: {
  th: ThemeConfig;
  themeId: string;
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <Animated.View
      entering={SlideInDown.springify().damping(17)}
      exiting={SlideOutDown.duration(180)}
      style={[s.sheet, { backgroundColor: th.surface, borderColor: th.line }]}
    >
      <View style={s.rowBetween}>
        <Text style={[s.sheetTitle, { color: th.text }]}>Atmosfera</Text>
        <Tap onPress={onClose} style={s.sheetClose}>
          <Ionicons name="close" size={20} color={th.soft} />
        </Tap>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingTop: 12, paddingBottom: 4 }}
      >
        {THEME_LIST.map((t) => {
          const sel = t.id === themeId;
          return (
            <Tap
              key={t.id}
              onPress={() => onPick(t.id)}
              tilt={-2}
              style={[
                s.atmosCard,
                { backgroundColor: t.bg, borderColor: sel ? th.accent : th.line, borderWidth: sel ? 3 : 1 },
              ]}
            >
              <Text style={{ fontSize: 30 }}>{t.emoji}</Text>
              <Text style={[s.atmosName, { color: t.text }]}>{t.name}</Text>
              <View style={[s.atmosDot, { backgroundColor: t.accent }]} />
            </Tap>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

function Reader({
  article,
  themeId,
  setThemeId,
  saved,
  setSaved,
  onBack,
}: {
  article: ReadingArticle;
  themeId: string;
  setThemeId: (id: string) => void;
  saved: string[];
  setSaved: React.Dispatch<React.SetStateAction<string[]>>;
  onBack: (pct: number) => void;
}) {
  const th = THEMES[themeId] || THEMES.paper;
  const topInset = StatusBar.currentHeight || 44;
  const scrollRef = useRef<ScrollView>(null);
  const paraY = useRef<Record<number, number>>({});
  const pctRef = useRef(0);
  const progress = useSharedValue(0);
  const contentOpacity = useSharedValue(1);
  const [baseBg] = useState(th.bg);

  const [fontKey, setFontKey] = useState('serif');
  const [size, setSize] = useState(19);
  const [showTr, setShowTr] = useState(false);
  const [hardMode, setHardMode] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [openTr, setOpenTr] = useState<number[]>([]);
  const [panel, setPanel] = useState<'settings' | 'atmos' | null>(null);
  const [wordSheet, setWordSheet] = useState<{ word: string } | null>(null);
  const [activeP, setActiveP] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [curSent, setCurSent] = useState(-1);
  const [rate, setRate] = useState(1);
  const [pct, setPct] = useState(0);
  const [finished, setFinished] = useState(false);
  const [burst, setBurst] = useState(0);
  const [hint, setHint] = useState(true);
  const [bgPrev, setBgPrev] = useState<string | null>(null);

  const sentencesByPara = useMemo(() => article.paras.map((p) => splitSentences(p.en)), [article]);
  const offsets = useMemo(() => {
    let o = 0;
    return sentencesByPara.map((ss) => {
      const cur = o;
      o += ss.length;
      return cur;
    });
  }, [sentencesByPara]);
  const flat = useMemo(
    () => sentencesByPara.flatMap((ss, pi) => ss.map((t) => ({ p: pi, text: t.trim() }))),
    [sentencesByPara]
  );
  const articleWords = useMemo(() => {
    const set = new Set<string>();
    article.paras.forEach((p) =>
      p.en.split(/\s+/).forEach((t) => {
        const w = normWord(t);
        if (w) set.add(w);
      })
    );
    return set;
  }, [article]);
  const savedHere = saved.filter((w) => articleWords.has(w));

  // ── Ovozli o‘qish (TTS) ──
  const playRef = useRef(false);
  const tokenRef = useRef(0);
  const rateRef = useRef(1);
  const flatRef = useRef(flat);

  const speakAt = (i: number) => {
    const list = flatRef.current;
    if (i < 0) i = 0;
    if (i >= list.length) {
      playRef.current = false;
      setPlaying(false);
      setCurSent(-1);
      return;
    }
    setCurSent(i);
    const token = ++tokenRef.current;
    Speech.speak(list[i].text, {
      language: 'en-US',
      rate: rateRef.current,
      onDone: () => {
        if (playRef.current && tokenRef.current === token) speakAt(i + 1);
      },
      onError: () => {
        playRef.current = false;
        setPlaying(false);
      },
    });
  };

  const togglePlay = () => {
    if (playing) {
      playRef.current = false;
      tokenRef.current++;
      setPlaying(false);
      Speech.stop();
    } else {
      playRef.current = true;
      setPlaying(true);
      speakAt(curSent < 0 ? 0 : curSent);
    }
  };

  const jump = (d: number) => {
    const base = curSent < 0 ? 0 : curSent;
    const next = Math.min(Math.max(base + d, 0), flat.length - 1);
    Speech.stop();
    if (playRef.current) speakAt(next);
    else setCurSent(next);
  };

  const cycleRate = () => {
    const order = [0.75, 1, 1.25];
    const next = order[(order.indexOf(rate) + 1) % order.length];
    rateRef.current = next;
    setRate(next);
    if (playRef.current) {
      Speech.stop();
      speakAt(curSent < 0 ? 0 : curSent);
    }
  };

  useEffect(
    () => () => {
      playRef.current = false;
      tokenRef.current++;
      Speech.stop();
    },
    []
  );

  // Ovoz o‘qiyotgan abzatsga avtomatik siljish
  useEffect(() => {
    if (curSent < 0) return;
    const p = flat[curSent] ? flat[curSent].p : null;
    if (p == null) return;
    setActiveP(p);
    const y = paraY.current[p];
    if (playing && y != null && scrollRef.current) {
      scrollRef.current.scrollTo({ y: Math.max(0, y - 150), animated: true });
    }
  }, [curSent]);

  useEffect(() => {
    const t = setTimeout(() => setHint(false), 6500);
    return () => clearTimeout(t);
  }, []);

  const handleBack = () => onBack(finished ? 100 : pctRef.current);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (panel || wordSheet) {
        setPanel(null);
        setWordSheet(null);
      } else {
        handleBack();
      }
      return true;
    });
    return () => sub.remove();
  }, [panel, wordSheet, finished]);

  // ── Atmosfera almashtirish ──
  const changeTheme = (id: string) => {
    if (id === themeId) return;
    contentOpacity.value = withSequence(
      withTiming(0, { duration: 130 }),
      withTiming(1, { duration: 260 })
    );
    setTimeout(() => {
      setBgPrev(themeId);
      setThemeId(id);
      setTimeout(() => setBgPrev(null), 700);
    }, 130);
  };

  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value }));
  const progStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  const onScroll = (e: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const max = contentSize.height - layoutMeasurement.height;
    const p = max > 0 ? Math.min(Math.max(contentOffset.y / max, 0), 1) : 0;
    progress.value = p;
    const pc = Math.round(p * 100);
    if (pc !== pctRef.current) {
      pctRef.current = pc;
      setPct(pc);
    }
  };

  const onWord = (tok: string, pi: number) => {
    const w = normWord(tok);
    if (!w) return;
    setActiveP(pi);
    setPanel(null);
    setWordSheet({ word: w });
  };
  const toggleSaved = (w: string) =>
    setSaved((prev) => (prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]));
  const toggleTr = (pi: number) =>
    setOpenTr((prev) => (prev.includes(pi) ? prev.filter((x) => x !== pi) : [...prev, pi]));
  const finish = () => {
    if (finished) return;
    setFinished(true);
    setBurst((b) => b + 1);
  };
  const openPanel = (name: 'settings' | 'atmos') => {
    setWordSheet(null);
    setPanel((p) => (p === name ? null : name));
  };

  const fontFamily = fontKey === 'serif' ? F.serif : F.sans;
  const minsLeft = Math.max(0, Math.ceil(article.minutes * (1 - pct / 100)));
  const sheetBottom = 90;

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: baseBg }]}>
      <StatusBar barStyle={th.dark ? 'light-content' : 'dark-content'} backgroundColor={th.bg} />

      {/* Fon qatlamlari */}
      {bgPrev && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: THEMES[bgPrev]?.bg }]} />
      )}
      <Animated.View
        key={themeId}
        entering={FadeIn.duration(500)}
        style={[StyleSheet.absoluteFill, { backgroundColor: th.bg }]}
      >
        <Ambient id={themeId} />
      </Animated.View>

      {/* Matn */}
      <Animated.View style={[{ flex: 1 }, contentStyle]}>
        <ScrollView
          ref={scrollRef}
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: topInset + 92,
            paddingHorizontal: 24,
            paddingBottom: 400,
          }}
        >
          <View style={[s.lvlChip, { backgroundColor: th.accent, alignSelf: 'flex-start' }]}>
            <Text style={[s.lvlText, { color: th.onAccent }]}>{article.level}</Text>
          </View>
          <Text style={[s.articleTitle, { color: th.text }]}>{article.title}</Text>
          <Text style={[s.articleMeta, { color: th.soft }]}>
            {article.minutes} daqiqa · {article.paras.length} abzats
          </Text>

          {article.paras.map((p, pi) => (
            <Paragraph
              key={pi}
              para={p}
              pi={pi}
              sentences={sentencesByPara[pi]}
              offset={offsets[pi]}
              th={th}
              fontFamily={fontFamily}
              size={size}
              curSent={curSent}
              saved={saved}
              hardMode={hardMode}
              trVisible={showTr || openTr.includes(pi)}
              dim={focusMode && pi !== activeP}
              onWord={onWord}
              onToggleTr={toggleTr}
              onLayoutY={(i, y) => {
                paraY.current[i] = y;
              }}
            />
          ))}

          {/* Matn oxiri */}
          <View style={[s.endCard, { backgroundColor: th.surface, borderColor: th.line }]}>
            <Text style={[s.endTitle, { color: th.text }]}>Bu matndan saqlangan so‘zlar</Text>
            {savedHere.length === 0 ? (
              <Text style={[s.endSub, { color: th.soft }]}>
                Hali yo‘q. So‘zni bosib, “Lug‘atga qo‘shish”ni tanlang.
              </Text>
            ) : (
              <View style={s.chipsWrap}>
                {savedHere.map((w) => (
                  <View key={w} style={[s.savedChip, { backgroundColor: th.accent + '30' }]}>
                    <Text style={[s.savedChipText, { color: th.text }]}>{w}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={{ marginTop: 18 }}>
              <Tap
                onPress={finish}
                style={[s.finishBtn, { backgroundColor: finished ? th.text : th.accent }]}
              >
                <Ionicons
                  name={finished ? 'checkmark-circle' : 'flag'}
                  size={20}
                  color={finished ? th.surface : th.onAccent}
                />
                <Text style={[s.finishText, { color: finished ? th.surface : th.onAccent }]}>
                  {finished ? 'Bajarildi · +20 XP' : 'Tugatdim · +20 XP'}
                </Text>
              </Tap>
              <Confetti burst={burst} />
            </View>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Tepa va past xira o‘tish */}
      <LinearGradient
        pointerEvents="none"
        colors={[th.bg, th.bg + '00']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: topInset + 100 }}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[th.bg + '00', th.bg]}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 150 }}
      />

      {/* Tepa panel */}
      <View style={[s.topBar, { paddingTop: topInset + 6 }]} pointerEvents="box-none">
        <View style={s.topRow}>
          <Tap
            onPress={handleBack}
            style={[s.roundBtn, { backgroundColor: th.surface, borderColor: th.line }]}
          >
            <Ionicons name="chevron-back" size={22} color={th.text} />
          </Tap>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={[s.topTitle, { color: th.text }]}>
              {article.title}
            </Text>
            <Text style={[s.topSub, { color: th.soft }]}>
              {pct}% · ≈{minsLeft} daqiqa qoldi
            </Text>
          </View>
          <View style={[s.countChip, { backgroundColor: th.surface, borderColor: th.line }]}>
            <Ionicons name="star" size={13} color={th.accent} />
            <Text style={[s.countText, { color: th.text }]}>{saved.length}</Text>
          </View>
        </View>
        <View style={[s.progTrack, { backgroundColor: th.line }]}>
          <Animated.View style={[s.progFill, { backgroundColor: th.accent }, progStyle]} />
        </View>
      </View>

      {/* Ko‘rsatma */}
      {hint && (
        <Animated.View
          entering={FadeInDown.delay(600)}
          exiting={FadeOut}
          pointerEvents="none"
          style={[s.hint, { top: topInset + 78, backgroundColor: th.surface, borderColor: th.line }]}
        >
          <Ionicons name="hand-left" size={15} color={th.accent} />
          <Text style={[s.hintText, { color: th.text }]}>
            So‘zni bosing: tarjima · Abzatsni uzoq bosing: butun tarjima
          </Text>
        </Animated.View>
      )}

      {/* Pastki panel (dock) */}
      <View
        style={[s.dock, { backgroundColor: th.surface, borderColor: th.line }]}
        pointerEvents="box-none"
      >
        <IconBtn icon="color-palette" th={th} active={panel === 'atmos'} onPress={() => openPanel('atmos')} />
        <IconBtn icon="play-skip-back" th={th} onPress={() => jump(-1)} />
        <View>
          {playing && <PlayRing th={th} />}
          <Tap onPress={togglePlay} style={[s.playBtn, { backgroundColor: th.accent }]}>
            <Ionicons name={playing ? 'pause' : 'play'} size={24} color={th.onAccent} />
          </Tap>
        </View>
        <IconBtn icon="play-skip-forward" th={th} onPress={() => jump(1)} />
        <Tap onPress={cycleRate} style={[s.rateChip, { borderColor: th.line }]}>
          <Text style={[s.rateText, { color: th.text }]}>{rate}x</Text>
        </Tap>
        <Tap
          onPress={() => openPanel('settings')}
          style={[
            { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
            panel === 'settings' && { backgroundColor: th.accent + '33' },
          ]}
        >
          <Text style={{ fontFamily: F.display, fontSize: 17, color: panel === 'settings' ? th.accent : th.text }}>
            Aa
          </Text>
        </Tap>
      </View>

      {/* Panellar */}
      <View style={{ position: 'absolute', left: 12, right: 12, bottom: sheetBottom }} pointerEvents="box-none">
        {wordSheet && (
          <WordSheet
            th={th}
            word={wordSheet.word}
            isSaved={saved.includes(wordSheet.word)}
            onToggleSave={toggleSaved}
            onClose={() => setWordSheet(null)}
          />
        )}
        {panel === 'settings' && (
          <SettingsSheet
            th={th}
            onClose={() => setPanel(null)}
            fontKey={fontKey}
            setFontKey={setFontKey}
            size={size}
            setSize={setSize}
            showTr={showTr}
            setShowTr={setShowTr}
            hardMode={hardMode}
            setHardMode={setHardMode}
            focusMode={focusMode}
            setFocusMode={setFocusMode}
          />
        )}
        {panel === 'atmos' && (
          <AtmosSheet th={th} themeId={themeId} onPick={changeTheme} onClose={() => setPanel(null)} />
        )}
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════
//  KUTUBXONA
// ═══════════════════════════════════════════════════════════

function TextCard({
  item,
  pct,
  onPress,
}: {
  item: ReadingArticle;
  pct: number;
  onPress: () => void;
}) {
  return (
    <Tap onPress={onPress} tilt={-1} style={s.libShadow}>
      <View style={s.libCard}>
        <View style={[s.cover, { backgroundColor: item.color }]}>
          <Text style={{ fontSize: 30 }}>{item.emoji}</Text>
        </View>
        <View style={{ flex: 1, gap: 7 }}>
          <Text style={s.libTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={s.metaRow}>
            <View style={[s.lvlChip, { backgroundColor: item.color }]}>
              <Text style={[s.lvlText, { color: item.fg }]}>{item.level}</Text>
            </View>
            <Text style={s.metaText}>{item.minutes} daqiqa</Text>
            <Text style={s.metaText}>·</Text>
            <Text style={s.metaText}>{item.paras.length} abzats</Text>
          </View>
          <MiniBar value={pct} color={C.violet} track={C.track} />
        </View>
        {pct >= 100 ? (
          <Ionicons name="checkmark-circle" size={26} color={C.mint} />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={C.inkSoft} />
        )}
      </View>
    </Tap>
  );
}

function AddSheet({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (title: string, body: string) => void;
}) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const words = body.trim() ? body.trim().split(/\s+/).filter(Boolean).length : 0;
  const paste = async () => {
    try {
      const t = await Clipboard.getStringAsync();
      if (t) setBody(t);
    } catch (e) {}
  };
  const ready = words >= 5;
  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(29,17,71,0.45)' }]}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'flex-end' }}
        pointerEvents="box-none"
      >
        <Animated.View
          entering={SlideInDown.springify().damping(16)}
          exiting={SlideOutDown.duration(200)}
          style={s.addSheet}
        >
          <View style={s.rowBetween}>
            <Text style={s.addTitle}>Yangi matn</Text>
            <Tap onPress={onClose} style={s.sheetClose}>
              <Ionicons name="close" size={20} color={C.inkSoft} />
            </Tap>
          </View>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Sarlavha (ixtiyoriy)"
            placeholderTextColor={C.inkSoft}
            style={s.addInput}
          />
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Inglizcha matnni shu yerga joylashtiring..."
            placeholderTextColor={C.inkSoft}
            multiline
            textAlignVertical="top"
            style={[s.addInput, { height: 160, paddingTop: 14 }]}
          />

          <View style={[s.rowBetween, { marginTop: 14 }]}>
            <Tap onPress={paste} style={s.pasteBtn}>
              <Ionicons name="clipboard" size={17} color={C.violet} />
              <Text style={s.pasteText}>Buferdan joylash</Text>
            </Tap>
            <Text style={s.metaText}>{words} so‘z</Text>
          </View>

          <Tap
            onPress={() => {
              if (!ready) return;
              onAdd(title.trim() || 'Mening matnim', body.trim());
            }}
            style={[s.addBtn, !ready && { opacity: 0.4 }]}
          >
            <Text style={s.addBtnText}>Kutubxonaga qo‘shish</Text>
            <Ionicons name="arrow-forward" size={18} color={C.ink} />
          </Tap>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

function Library({
  texts,
  progress,
  savedCount,
  themeId,
  setThemeId,
  onOpen,
  onAddPress,
}: {
  texts: ReadingArticle[];
  progress: Record<string | number, number>;
  savedCount: number;
  themeId: string;
  setThemeId: (id: string) => void;
  onOpen: (id: string | number) => void;
  onAddPress: () => void;
}) {
  const cont =
    texts.find((t) => (progress[t.id] || 0) > 0 && (progress[t.id] || 0) < 100) || texts[0];
  const contPct = cont ? progress[cont.id] || 0 : 0;
  const contLeft = cont ? Math.max(1, Math.ceil(cont.minutes * (1 - contPct / 100))) : 0;

  return (
    <View style={{ flex: 1 }}>
      <Blob color={C.blue} size={220} top={-80} right={-90} />
      <Blob color={C.pink} size={170} top={420} left={-90} delay={900} />
      <Blob color={C.yellow} size={190} top={760} right={-100} delay={1800} />

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.springify().damping(14)} style={s.header}>
          <View>
            <Text style={s.title}>Mutolaa</Text>
            <Text style={s.subtitle}>
              {texts.length} ta matn · {savedCount} so‘z saqlangan
            </Text>
          </View>
          <Wiggle emoji="📖" />
        </Animated.View>

        {/* Davom ettirish */}
        {cont && (
          <Animated.View entering={ZoomIn.delay(120).springify().damping(13)}>
            <Tap onPress={() => onOpen(cont.id)} style={s.heroShadow}>
              <View style={s.heroFace}>
                <View style={[s.deco, { width: 150, height: 150, top: -50, right: -40, backgroundColor: cont.color }]} />
                <Text style={s.heroEmoji}>{cont.emoji}</Text>
                <View style={s.chipDark}>
                  <Ionicons name="book" size={13} color={C.yellow} />
                  <Text style={s.chipDarkText}>Davom ettirish</Text>
                </View>
                <View>
                  <Text style={s.heroTitle} numberOfLines={2}>
                    {cont.title}
                  </Text>
                  <Text style={s.heroMeta}>
                    {contPct}% o‘qildi · ≈{contLeft} daqiqa qoldi
                  </Text>
                  <View style={s.heroTrack}>
                    <View style={[s.heroFill, { width: `${Math.max(contPct, 4)}%` }]} />
                  </View>
                </View>
              </View>
            </Tap>
          </Animated.View>
        )}

        {/* Atmosfera tanlash */}
        <Animated.View entering={FadeInDown.delay(300).springify().damping(14)} style={{ marginTop: 26 }}>
          <Text style={s.sectionTitle}>Mutolaa atmosferasi</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -20 }}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingVertical: 8 }}
          >
            {THEME_LIST.map((t) => {
              const sel = t.id === themeId;
              return (
                <Tap
                  key={t.id}
                  onPress={() => setThemeId(t.id)}
                  tilt={-2}
                  style={[
                    s.themeChip,
                    { backgroundColor: t.bg },
                    sel && { borderColor: C.ink, borderWidth: 3 },
                  ]}
                >
                  <Text style={{ fontSize: 24 }}>{t.emoji}</Text>
                  <Text style={[s.themeName, { color: t.text }]}>{t.name}</Text>
                </Tap>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Matn qo‘shish */}
        <Animated.View entering={FadeInDown.delay(400).springify().damping(14)} style={{ marginTop: 18 }}>
          <Tap onPress={onAddPress} style={s.addTile}>
            <View style={s.addPlus}>
              <Ionicons name="add" size={26} color={C.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.addTileTitle}>O‘z matningizni qo‘shing</Text>
              <Text style={s.addTileSub}>Joylashtiring, so‘zlarni bosib o‘rganing</Text>
            </View>
          </Tap>
        </Animated.View>

        {/* Ro‘yxat */}
        <Text style={[s.sectionTitle, { marginTop: 26, marginBottom: 12 }]}>Matnlar</Text>
        {texts.map((t, i) => (
          <Animated.View
            key={t.id}
            entering={ZoomIn.delay(520 + i * 80).springify().damping(13)}
            style={{ marginBottom: 14 }}
          >
            <TextCard item={t} pct={progress[t.id] || 0} onPress={() => onOpen(t.id)} />
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Asosiy ekran ────────────────────────────────────────
export interface ReadingScreenProps {
  onOpenReader?: (id: string) => void;
  onReaderModeChange?: (isInReader: boolean) => void;
}

export const ReadingScreen: React.FC<ReadingScreenProps> = ({ onReaderModeChange }) => {
  const [fontsLoaded] = useFonts({
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
    Lora_400Regular,
    Lexend_400Regular,
  });

  const { vocabulary, addWordToVocab, addReadMinutes } = useApp();

  const [texts, setTexts] = useState<ReadingArticle[]>(MOCK_TEXTS);
  const [progress, setProgress] = useState<Record<string | number, number>>({ 1: 40, 2: 0, 3: 100 });
  const [openId, setOpenId] = useState<string | number | null>(null);
  const [themeId, setThemeId] = useState('paper');
  const [saved, setSaved] = useState<string[]>(['lighthouse', 'harbor']);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    onReaderModeChange?.(openId !== null);
  }, [openId, onReaderModeChange]);

  // Sync saved words from vocabulary if available
  useEffect(() => {
    if (vocabulary && vocabulary.length > 0) {
      const vocabWords = vocabulary.map((v) => v.word.toLowerCase());
      setSaved((prev) => Array.from(new Set([...prev, ...vocabWords])));
    }
  }, [vocabulary]);

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: C.bg }} />;

  const openText = texts.find((t) => t.id === openId);

  const addText = (title: string, body: string) => {
    const paras = body
      .split(/\n+/)
      .map((x) => x.trim())
      .filter(Boolean)
      .map((en) => ({ en, uz: null }));
    const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
    const id = Date.now().toString();
    setTexts((prev) => [
      {
        id,
        title,
        level: 'Mening',
        minutes: Math.max(1, Math.round(wordCount / 120)),
        emoji: '✍️',
        color: C.pink,
        fg: C.ink,
        paras,
      },
      ...prev,
    ]);
    setAdding(false);
  };

  const handleToggleSaved = (word: string) => {
    setSaved((prev) => {
      const isAlready = prev.includes(word);
      if (!isAlready) {
        addWordToVocab(word).catch(() => {});
        return [...prev, word];
      } else {
        return prev.filter((x) => x !== word);
      }
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, overflow: 'hidden' }}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <Library
        texts={texts}
        progress={progress}
        savedCount={saved.length}
        themeId={themeId}
        setThemeId={setThemeId}
        onOpen={(id) => setOpenId(id)}
        onAddPress={() => setAdding(true)}
      />

      {adding && <AddSheet onClose={() => setAdding(false)} onAdd={addText} />}

      {openText && (
        <Animated.View
          entering={SlideInRight.springify().damping(18)}
          exiting={SlideOutRight.duration(220)}
          style={StyleSheet.absoluteFill}
        >
          <Reader
            article={openText}
            themeId={themeId}
            setThemeId={setThemeId}
            saved={saved}
            setSaved={setSaved}
            onBack={(pct) => {
              setProgress((prev) => ({ ...prev, [openText.id]: Math.max(prev[openText.id] || 0, pct) }));
              if (pct > 20) {
                addReadMinutes(Math.max(1, Math.round((openText.minutes * pct) / 100))).catch(() => {});
              }
              setOpenId(null);
            }}
          />
        </Animated.View>
      )}
    </View>
  );
};

export default ReadingScreen;

// ─── Styles ──────────────────────────────────────────────
const s = StyleSheet.create({
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontFamily: F.bodySemi, fontSize: 13, color: C.inkSoft },
  deco: { position: 'absolute', borderRadius: 999 },

  // Library
  scroll: {
    paddingHorizontal: 20,
    paddingTop: (StatusBar.currentHeight || 44) + 14,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontFamily: F.display, fontSize: 40, color: C.ink, letterSpacing: -1.2 },
  subtitle: { fontFamily: F.bodySemi, fontSize: 14, color: C.inkSoft, marginTop: -2 },
  sectionTitle: { fontFamily: F.display, fontSize: 22, color: C.ink, letterSpacing: -0.5 },

  heroShadow: {
    borderRadius: 32,
    backgroundColor: C.ink,
    shadowColor: C.ink,
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  heroFace: {
    borderRadius: 32,
    padding: 22,
    height: 220,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  heroEmoji: { position: 'absolute', right: 26, top: 24, fontSize: 56, transform: [{ rotate: '8deg' }] },
  chipDark: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipDarkText: { fontFamily: F.bodySemi, fontSize: 13, color: C.white },
  heroTitle: {
    fontFamily: F.display,
    fontSize: 30,
    lineHeight: 33,
    color: C.white,
    letterSpacing: -0.8,
    maxWidth: '82%',
  },
  heroMeta: { fontFamily: F.bodySemi, fontSize: 14, color: '#B9A8FF', marginTop: 6 },
  heroTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.16)',
    marginTop: 12,
    overflow: 'hidden',
  },
  heroFill: { height: '100%', borderRadius: 5, backgroundColor: C.yellow },

  themeChip: {
    width: 96,
    height: 84,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(29,17,71,0.1)',
  },
  themeName: { fontFamily: F.bodyBold, fontSize: 13 },

  addTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: C.violet,
    backgroundColor: 'rgba(124,77,255,0.07)',
  },
  addPlus: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: C.violet,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-6deg' }],
  },
  addTileTitle: { fontFamily: F.displayMd, fontSize: 17, color: C.ink },
  addTileSub: { fontFamily: F.body, fontSize: 13, color: C.inkSoft, marginTop: 2 },

  libShadow: {
    borderRadius: 26,
    backgroundColor: C.white,
    shadowColor: C.ink,
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  libCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 26 },
  cover: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-5deg' }],
  },
  libTitle: { fontFamily: F.display, fontSize: 18, color: C.ink, letterSpacing: -0.3 },
  lvlChip: { borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  lvlText: { fontFamily: F.bodyBold, fontSize: 12 },
  miniTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  miniFill: { height: '100%', borderRadius: 3 },

  // Add sheet
  addSheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 22,
    paddingBottom: 30,
  },
  addTitle: { fontFamily: F.display, fontSize: 24, color: C.ink, letterSpacing: -0.5 },
  addInput: {
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: C.bg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: F.bodySemi,
    fontSize: 15,
    color: C.ink,
  },
  pasteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(124,77,255,0.12)',
  },
  pasteText: { fontFamily: F.bodyBold, fontSize: 14, color: C.violet },
  addBtn: {
    marginTop: 16,
    height: 54,
    borderRadius: 27,
    backgroundColor: C.yellow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addBtnText: { fontFamily: F.bodyBold, fontSize: 16, color: C.ink },

  // Reader — umumiy
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 16 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roundBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: { fontFamily: F.bodyBold, fontSize: 16 },
  topSub: { fontFamily: F.bodySemi, fontSize: 12.5, marginTop: 1 },
  countChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  countText: { fontFamily: F.bodyBold, fontSize: 14 },
  progTrack: { height: 4, borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  progFill: { height: '100%', borderRadius: 2 },
  hint: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginHorizontal: 20,
  },
  hintText: { fontFamily: F.bodySemi, fontSize: 12.5, flexShrink: 1 },

  articleTitle: {
    fontFamily: F.display,
    fontSize: 32,
    lineHeight: 35,
    letterSpacing: -0.9,
    marginTop: 12,
  },
  articleMeta: { fontFamily: F.bodySemi, fontSize: 14, marginTop: 6, marginBottom: 26 },
  trBox: { marginTop: 10, paddingLeft: 12, borderLeftWidth: 3 },
  trText: { fontFamily: F.body, fontSize: 15, lineHeight: 22 },

  endCard: { borderRadius: 28, borderWidth: 1, padding: 20, marginTop: 8 },
  endTitle: { fontFamily: F.display, fontSize: 19, letterSpacing: -0.3 },
  endSub: { fontFamily: F.body, fontSize: 14, marginTop: 6 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  savedChip: { borderRadius: 999, paddingVertical: 7, paddingHorizontal: 14 },
  savedChipText: { fontFamily: F.bodyBold, fontSize: 14 },
  finishBtn: {
    height: 54,
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  finishText: { fontFamily: F.bodyBold, fontSize: 16 },

  // Dock
  dock: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 14,
    height: 66,
    borderRadius: 33,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  playBtn: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  rateChip: {
    height: 34,
    minWidth: 48,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  rateText: { fontFamily: F.bodyBold, fontSize: 13.5 },

  // Sheets
  sheet: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  sheetTitle: { fontFamily: F.display, fontSize: 20, letterSpacing: -0.4 },
  sheetClose: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  wsWord: { fontFamily: F.display, fontSize: 32, letterSpacing: -0.8 },
  wsMeta: { fontFamily: F.bodySemi, fontSize: 14, marginTop: 1 },
  wsUz: { fontFamily: F.display, fontSize: 26, letterSpacing: -0.5, marginTop: 10 },
  wsNone: { fontFamily: F.body, fontSize: 14, lineHeight: 20, marginTop: 10 },
  wsActions: { flexDirection: 'row', gap: 8, marginTop: 16 },
  wsBtn: {
    height: 46,
    borderRadius: 23,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  wsBtnText: { fontFamily: F.bodyBold, fontSize: 14.5 },

  setLabel: { fontFamily: F.bodyBold, fontSize: 15 },
  setSub: { fontFamily: F.body, fontSize: 12.5, marginTop: 1 },
  fontChip: { borderRadius: 14, borderWidth: 1, paddingVertical: 8, paddingHorizontal: 14 },
  sizeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeVal: { fontFamily: F.display, fontSize: 18, minWidth: 30, textAlign: 'center' },
  toggleTrack: { width: 48, height: 28, borderRadius: 14 },
  toggleKnob: {
    position: 'absolute',
    top: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },

  atmosCard: {
    width: 92,
    height: 118,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  atmosName: { fontFamily: F.bodyBold, fontSize: 13.5 },
  atmosDot: { width: 18, height: 6, borderRadius: 3 },
});
