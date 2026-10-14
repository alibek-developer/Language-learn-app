// HomeScreen.jsx — light, bright, animated
//
// O‘rnatish:
//   npx expo install react-native-reanimated expo-linear-gradient expo-font \
//     @expo-google-fonts/bricolage-grotesque @expo-google-fonts/figtree
//
// Shriftlar: Bricolage Grotesque (sarlavha, ekspressiv) + Figtree (matn)

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  interpolate,
  Easing,
  FadeInDown,
  ZoomIn,
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
};

// ─── Mock data ───────────────────────────────────────────
const user = {
  name: 'Alibek',
  streak: 7,
  level: 'B1',
  levelName: 'O‘rta daraja',
  xp: 320,
  xpGoal: 500,
};

const wordOfDay = {
  word: 'Serendipity',
  uz: 'Baxtli tasodif',
  example: 'Meeting her was pure serendipity.',
};

const tasks = {
  reading: { title: 'The Little Prince', time: '4 daqiqa', page: 2, pages: 3, done: false },
  vocab: { learned: 2, goal: 10, done: false },
  writing: { prompt: 'Mening kunlik taassurotlarim', done: true },
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return 'Xayrli tun';
  if (h < 12) return 'Xayrli tong';
  if (h < 18) return 'Xayrli kun';
  return 'Xayrli kech';
};

const todayIdx = (new Date().getDay() + 6) % 7; // Dushanba = 0

// ─── Helpers ─────────────────────────────────────────────
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Bosilganda springli scale + ozgina qiyshayish
function Tap({ children, style, onPress, tilt = 0 }) {
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

// Sekin suzib yuruvchi rangli dog‘lar (fon)
function Blob({ color, size, top, left, right, delay = 0, drift = 16 }) {
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
          opacity: 0.32,
          top,
          left,
          right,
        },
        a,
      ]}
    />
  );
}

// Lapillab turadigan olov
function Flame() {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 650, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 650, easing: Easing.inOut(Easing.quad) })
      ),
      -1
    );
  }, []);
  const a = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(t.value, [0, 1], [1, 1.22]) },
      { rotate: `${interpolate(t.value, [0, 1], [-7, 7])}deg` },
    ],
  }));
  return <Animated.Text style={[{ fontSize: 22 }, a]}>🔥</Animated.Text>;
}

// 0 dan sanab chiqadigan raqam
function CountUp({ to, style, duration = 1100, delay = 450 }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf;
    let start;
    const timer = setTimeout(() => {
      const tick = (now) => {
        if (!start) start = now;
        const p = Math.min((now - start) / duration, 1);
        setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [to]);
  return <Text style={style}>{v}</Text>;
}

// Gradientli, yaltirab o‘tadigan XP bar
function XpBar({ value, total }) {
  const fill = useSharedValue(0);
  const sweep = useSharedValue(0);
  useEffect(() => {
    fill.value = withDelay(
      500,
      withTiming(Math.min(value / total, 1), {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      })
    );
    sweep.value = withDelay(
      1800,
      withRepeat(
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
        -1
      )
    );
  }, [value, total]);
  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));
  const sweepStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(sweep.value, [0, 1], [-60, 320]) },
      { skewX: '-20deg' },
    ],
  }));
  return (
    <View style={s.xpTrack}>
      <Animated.View style={[s.xpFill, fillStyle]}>
        <LinearGradient
          colors={[C.violet, C.blue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[s.xpSweep, sweepStyle]} />
      </Animated.View>
    </View>
  );
}

// Kichik progress bar (lug‘at kartochkasi uchun)
function MiniBar({ value, total, color, track }) {
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withDelay(
      1000,
      withTiming(Math.min(value / total, 1), {
        duration: 900,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [value, total]);
  const a = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View style={[s.miniTrack, { backgroundColor: track }]}>
      <Animated.View style={[s.miniFill, { backgroundColor: color }, a]} />
    </View>
  );
}

// ─── Kunlik so‘z: aylanadigan karta ─────────────────────
function WordCard() {
  const flip = useSharedValue(0);
  const toggle = () => {
    flip.value = withSpring(flip.value < 0.5 ? 1 : 0, {
      damping: 14,
      stiffness: 110,
    });
  };
  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` },
    ],
  }));
  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(flip.value, [0, 1], [180, 360])}deg` },
    ],
  }));

  return (
    <Tap onPress={toggle} style={s.wordWrap}>
      {/* Old tomon */}
      <Animated.View style={[s.wordFace, { backgroundColor: C.ink }, frontStyle]}>
        <View style={[s.deco, s.decoPink]} />
        <View style={[s.deco, s.decoYellow]} />
        <View style={s.chipDark}>
          <Text style={s.chipDarkText}>Kunlik so‘z</Text>
        </View>
        <Text style={s.wordBig} numberOfLines={1} adjustsFontSizeToFit>
          {wordOfDay.word}
        </Text>
        <View style={s.hintRow}>
          <Ionicons name="sync" size={15} color="#B9A8FF" />
          <Text style={s.hintText}>Tarjimasini ko‘rish uchun bosing</Text>
        </View>
      </Animated.View>

      {/* Orqa tomon */}
      <Animated.View style={[s.wordFace, { backgroundColor: C.mint }, backStyle]}>
        <View style={s.chipLight}>
          <Text style={s.chipLightText}>O‘zbekcha</Text>
        </View>
        <View>
          <Text style={s.wordUz} numberOfLines={2}>
            {wordOfDay.uz}
          </Text>
          <Text style={s.wordExample}>{wordOfDay.example}</Text>
        </View>
        <View style={s.hintRow}>
          <Ionicons name="sync" size={15} color={C.ink} />
          <Text style={[s.hintText, { color: C.ink }]}>Qaytish uchun bosing</Text>
        </View>
      </Animated.View>
    </Tap>
  );
}

// ─── Hafta kunlari ───────────────────────────────────────
function WeekRow() {
  const days = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];
  return (
    <View style={s.weekRow}>
      {days.map((d, i) => {
        const done = i < todayIdx;
        const today = i === todayIdx;
        return (
          <Animated.View
            key={d}
            entering={ZoomIn.delay(520 + i * 60).springify().damping(9)}
            style={s.dayCol}
          >
            <View
              style={[
                s.dayDot,
                done && { backgroundColor: C.yellow },
                today && { backgroundColor: C.ink },
              ]}
            >
              {done && <Ionicons name="checkmark" size={17} color={C.ink} />}
              {today && <View style={s.dayTodayCore} />}
            </View>
            <Text style={[s.dayLabel, today && { color: C.ink, fontFamily: F.bodyBold }]}>
              {d}
            </Text>
          </Animated.View>
        );
      })}
    </View>
  );
}

// ─── Bento kartochka ─────────────────────────────────────
function Tile({ color, height, onPress, tilt, children }) {
  return (
    <Tap
      onPress={onPress}
      tilt={tilt}
      style={[s.tileShadow, { height, shadowColor: color, backgroundColor: color }]}
    >
      <View style={s.tileFace}>{children}</View>
    </Tap>
  );
}

const DoneBadge = () => (
  <View style={s.doneBadge}>
    <Ionicons name="checkmark" size={16} color={C.ink} />
  </View>
);

// ─── Asosiy ekran ────────────────────────────────────────
export const HomeScreen = () => {
  const [fontsLoaded] = useFonts({
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
  });

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: C.bg }} />;

  const doneCount = [tasks.reading.done, tasks.vocab.done, tasks.writing.done].filter(Boolean).length;

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Fon dog‘lari */}
      <Blob color={C.pink} size={220} top={-70} right={-80} />
      <Blob color={C.yellow} size={170} top={300} left={-90} delay={900} />
      <Blob color={C.mint} size={190} top={560} right={-100} delay={1800} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.springify().damping(14)} style={s.header}>
          <View>
            <Text style={s.greeting}>{greeting()},</Text>
            <Text style={s.name}>{user.name}</Text>
          </View>
          <View style={s.streakChip}>
            <Flame />
            <Text style={s.streakNum}>{user.streak}</Text>
            <Text style={s.streakUnit}>kun</Text>
          </View>
        </Animated.View>

        {/* Kunlik so‘z */}
        <Animated.View entering={ZoomIn.delay(120).springify().damping(13)}>
          <WordCard />
        </Animated.View>

        {/* Daraja va XP */}
        <Animated.View entering={FadeInDown.delay(300).springify().damping(14)} style={s.levelWrap}>
          <View style={s.levelRow}>
            <View style={s.levelBadge}>
              <Text style={s.levelBadgeText}>{user.level}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.levelName}>{user.levelName}</Text>
              <Text style={s.levelSub}>Bugungi maqsadga {user.xpGoal - user.xp} XP qoldi</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <CountUp to={user.xp} style={s.xpNumber} />
              <Text style={s.levelSub}>/ {user.xpGoal} XP</Text>
            </View>
          </View>
          <XpBar value={user.xp} total={user.xpGoal} />
        </Animated.View>

        {/* Hafta */}
        <WeekRow />

        {/* Vazifalar */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Bugungi vazifalar</Text>
          <Text style={s.sectionMeta}>{doneCount}/3 bajarildi</Text>
        </View>

        <View style={s.bento}>
          {/* Reading — baland, ko‘k */}
          <Animated.View entering={ZoomIn.delay(760).springify().damping(12)} style={{ flex: 1 }}>
            <Tile color={C.blue} height={232} tilt={-1.5} onPress={() => { /* TODO: navigation.navigate('Reading') */ }}>
              <View style={s.decoTile} />
              <View style={s.tileIconWhite}>
                <Ionicons name="book" size={20} color={C.blue} />
              </View>
              <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <Text style={s.tileLabelLight}>Mutolaa</Text>
                <Text style={s.readingTitle}>{tasks.reading.title}</Text>
                <Text style={s.readingMeta}>
                  {tasks.reading.time} · {tasks.reading.page}/{tasks.reading.pages} bet
                </Text>
              </View>
              <View style={s.arrowBtn}>
                <Ionicons name="arrow-forward" size={18} color={C.ink} />
              </View>
            </Tile>
          </Animated.View>

          {/* O‘ng ustun */}
          <View style={{ flex: 1, gap: 12 }}>
            <Animated.View entering={ZoomIn.delay(860).springify().damping(12)}>
              <Tile color={C.yellow} height={110} tilt={1.5} onPress={() => { /* TODO: navigation.navigate('Vocabulary') */ }}>
                <Text style={s.tileLabelDark}>Lug‘at</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5 }}>
                  <Text style={s.vocabNum}>{tasks.vocab.learned}</Text>
                  <Text style={s.vocabOf}>/ {tasks.vocab.goal} so‘z</Text>
                </View>
                <MiniBar value={tasks.vocab.learned} total={tasks.vocab.goal} color={C.ink} track="rgba(29,17,71,0.18)" />
              </Tile>
            </Animated.View>

            <Animated.View entering={ZoomIn.delay(960).springify().damping(12)}>
              <Tile color={C.pink} height={110} tilt={-1.5} onPress={() => { /* TODO: navigation.navigate('Writing') */ }}>
                <View style={s.rowBetween}>
                  <Text style={s.tileLabelDark}>Yozish</Text>
                  {tasks.writing.done && <DoneBadge />}
                </View>
                <Text style={s.writingPrompt} numberOfLines={2}>
                  {tasks.writing.prompt}
                </Text>
              </Tile>
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, overflow: 'hidden' },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: (StatusBar.currentHeight || 44) + 14,
    paddingBottom: 110,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: { fontFamily: F.bodySemi, fontSize: 15, color: C.inkSoft },
  name: {
    fontFamily: F.display,
    fontSize: 36,
    color: C.ink,
    letterSpacing: -1,
    marginTop: -2,
  },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.white,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 14,
    shadowColor: C.ink,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  streakNum: { fontFamily: F.display, fontSize: 20, color: C.ink },
  streakUnit: { fontFamily: F.bodySemi, fontSize: 13, color: C.inkSoft },

  // Word card
  wordWrap: {
    height: 214,
    marginBottom: 24,
    shadowColor: C.ink,
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
    borderRadius: 32,
  },
  wordFace: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    padding: 22,
    justifyContent: 'space-between',
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
  },
  deco: { position: 'absolute', borderRadius: 999 },
  decoPink: { width: 150, height: 150, top: -50, right: -40, backgroundColor: C.pink },
  decoYellow: { width: 46, height: 46, top: 96, right: 26, backgroundColor: C.yellow },
  chipDark: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipDarkText: { fontFamily: F.bodySemi, fontSize: 13, color: C.white },
  chipLight: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(29,17,71,0.12)',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipLightText: { fontFamily: F.bodySemi, fontSize: 13, color: C.ink },
  wordBig: {
    fontFamily: F.display,
    fontSize: 44,
    color: C.white,
    letterSpacing: -1.5,
  },
  wordUz: {
    fontFamily: F.display,
    fontSize: 38,
    lineHeight: 42,
    color: C.ink,
    letterSpacing: -1,
  },
  wordExample: {
    fontFamily: F.body,
    fontSize: 15,
    color: C.ink,
    opacity: 0.8,
    marginTop: 8,
  },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hintText: { fontFamily: F.bodySemi, fontSize: 13, color: '#B9A8FF' },

  // Level
  levelWrap: { marginBottom: 20 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  levelBadge: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: C.violet,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-6deg' }],
  },
  levelBadgeText: { fontFamily: F.display, fontSize: 24, color: C.white },
  levelName: { fontFamily: F.displayMd, fontSize: 18, color: C.ink },
  levelSub: { fontFamily: F.body, fontSize: 13, color: C.inkSoft, marginTop: 1 },
  xpNumber: { fontFamily: F.display, fontSize: 28, color: C.ink, letterSpacing: -0.5 },
  xpTrack: {
    height: 14,
    borderRadius: 7,
    backgroundColor: C.track,
    overflow: 'hidden',
  },
  xpFill: { height: '100%', borderRadius: 7, overflow: 'hidden' },
  xpSweep: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 40,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },

  // Week
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  dayCol: { alignItems: 'center', gap: 6 },
  dayDot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.track,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayTodayCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.yellow,
  },
  dayLabel: { fontFamily: F.bodySemi, fontSize: 12, color: C.inkSoft },

  // Section
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: F.display,
    fontSize: 24,
    color: C.ink,
    letterSpacing: -0.5,
  },
  sectionMeta: { fontFamily: F.bodySemi, fontSize: 14, color: C.inkSoft },

  // Bento
  bento: { flexDirection: 'row', gap: 12 },
  tileShadow: {
    borderRadius: 28,
    shadowOpacity: 0.32,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  tileFace: {
    flex: 1,
    borderRadius: 28,
    padding: 16,
    overflow: 'hidden',
  },
  decoTile: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    right: -60,
    top: -50,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  tileIconWhite: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabelLight: {
    fontFamily: F.bodySemi,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  tileLabelDark: { fontFamily: F.bodySemi, fontSize: 13, color: C.ink, opacity: 0.75 },
  readingTitle: {
    fontFamily: F.display,
    fontSize: 24,
    lineHeight: 26,
    color: C.white,
    letterSpacing: -0.5,
  },
  readingMeta: {
    fontFamily: F.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
    marginBottom: 34,
  },
  arrowBtn: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vocabNum: { fontFamily: F.display, fontSize: 32, color: C.ink, letterSpacing: -1 },
  vocabOf: { fontFamily: F.bodySemi, fontSize: 14, color: C.ink, opacity: 0.75 },
  miniTrack: { height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 6 },
  miniFill: { height: '100%', borderRadius: 3 },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doneBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  writingPrompt: {
    fontFamily: F.displayMd,
    fontSize: 15,
    lineHeight: 19,
    color: C.ink,
    marginTop: 'auto',
  },
});

export default HomeScreen;
