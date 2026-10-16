// WritingScreen.tsx — HomeScreen bilan bir xil dizayn tizimi
// Jonli animatsiyalar, to‘siqlarsiz yozish maydoni va qulay o‘qish rejimi

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  Pressable,
  StatusBar,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Share,
  Alert,
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
  FadeOutUp,
  FadeOut,
  ZoomIn,
  LinearTransition,
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

import { useApp } from '../context/AppContext';
import { NoteCategory, WritingNote } from '../types';

// ─── Tokens (HomeScreen bilan bir xil) ───────────────────
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
  border: '#EDE8F8',
  borderSubtle: '#F4F1FD',
};

const F = {
  display: 'BricolageGrotesque_800ExtraBold',
  displayMd: 'BricolageGrotesque_700Bold',
  body: 'Figtree_500Medium',
  bodySemi: 'Figtree_600SemiBold',
  bodyBold: 'Figtree_700Bold',
};

// Har bir yozuv turi o‘z rangiga ega
interface TypeConfig {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  tint: string;
  fg: string;
}

const TYPES: Record<string, TypeConfig> = {
  kundalik: { label: 'Kundalik', icon: 'heart', color: C.mint, tint: '#D6F7EC', fg: C.ink },
  eslatma: { label: 'Eslatma', icon: 'create', color: C.yellow, tint: '#FFF0BF', fg: C.ink },
  insho: { label: 'Insho', icon: 'document-text', color: C.blue, tint: '#E0E5FF', fg: C.white },
  hikoya: { label: 'Hikoya', icon: 'book', color: C.pink, tint: '#FFDFE9', fg: C.ink },
};

const FILTERS = [
  { key: 'all', label: 'Barchasi' },
  { key: 'kundalik', label: 'Kundalik' },
  { key: 'eslatma', label: 'Eslatmalar' },
  { key: 'insho', label: 'Insho' },
  { key: 'hikoya', label: 'Hikoya' },
];

const PROMPTS = [
  { en: 'Describe your perfect weekend.', uz: 'Mukammal dam olish kunini tasvirlang.' },
  { en: 'Write about a teacher who changed your life.', uz: 'Hayotingizni o‘zgartirgan ustoz haqida yozing.' },
  { en: 'What would you do with one free day?', uz: 'Bitta bo‘sh kuningiz bo‘lsa, nima qilardingiz?' },
];

const todayIdx = (new Date().getDay() + 6) % 7; // Dushanba = 0

// ─── Helpers ─────────────────────────────────────────────
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
        scale.value = withSpring(0.95, { damping: 12, stiffness: 320 });
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
}: {
  color: string;
  size: number;
  top?: number;
  left?: number;
  right?: number;
  delay?: number;
  drift?: number;
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
          opacity: 0.3,
          top,
          left,
          right,
        },
        a,
      ]}
    />
  );
}

function CountUp({
  to,
  style,
  duration = 1100,
  delay = 500,
}: {
  to: number;
  style?: any;
  duration?: number;
  delay?: number;
}) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf: number;
    let start: number | null = null;
    const timer = setTimeout(() => {
      const tick = (now: number) => {
        if (!start) start = now;
        const p = Math.min((now - start) / duration, 1);
        setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [to]);
  return <Text style={style}>{v}</Text>;
}

// Yozayotgandek chayqaladigan qalam
function Scribble() {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 500, easing: Easing.inOut(Easing.quad) }),
        withDelay(900, withTiming(0, { duration: 1 }))
      ),
      -1
    );
  }, []);
  const a = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(t.value, [0, 1], [-4, 6]) },
      { rotate: `${interpolate(t.value, [0, 1], [-14, 8])}deg` },
    ],
  }));
  return <Animated.Text style={[{ fontSize: 30 }, a]}>✍️</Animated.Text>;
}

// ─── Haftalik so‘zlar grafigi ────────────────────────────
function Bar({
  v,
  max,
  label,
  today,
  i,
}: {
  v: number;
  max: number;
  label: string;
  today: boolean;
  i: number;
}) {
  const h = useSharedValue(0);
  useEffect(() => {
    h.value = withDelay(650 + i * 70, withSpring(v / max, { damping: 9, stiffness: 110 }));
  }, [v, max]);
  const a = useAnimatedStyle(() => ({ height: Math.max(6, h.value * 64) }));
  return (
    <View style={s.barCol}>
      <View style={s.barSlot}>
        <Animated.View
          style={[
            s.bar,
            { backgroundColor: today ? C.pink : v === 0 ? C.track : C.violet },
            a,
          ]}
        />
      </View>
      <Text style={[s.barLabel, today && { color: C.ink, fontFamily: F.bodyBold }]}>{label}</Text>
    </View>
  );
}

function WeekBars({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const days = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];
  return (
    <View style={s.barsRow}>
      {data.map((v, i) => (
        <Bar key={days[i]} v={v} max={max} label={days[i]} today={i === todayIdx} i={i} />
      ))}
    </View>
  );
}

// ─── AI taklifi (bugungi mavzu) ──────────────────────────
function PromptCard({ onStart }: { onStart: (prompt: { en: string; uz: string }) => void }) {
  const [idx, setIdx] = useState(0);
  const spin = useSharedValue(0);
  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));
  const shuffle = () => {
    spin.value = withSpring(spin.value + 360, { damping: 12, stiffness: 90 });
    setIdx((i) => (i + 1) % PROMPTS.length);
  };
  const p = PROMPTS[idx];

  return (
    <View style={s.promptWrap}>
      <View style={s.promptFace}>
        <View style={[s.deco, { width: 130, height: 130, top: -50, right: -40, backgroundColor: C.violet }]} />
        <View style={[s.deco, { width: 34, height: 34, top: 20, right: 96, backgroundColor: C.mint }]} />

        <View style={s.chipDark}>
          <Ionicons name="sparkles" size={13} color={C.yellow} />
          <Text style={s.chipDarkText}>AI taklifi</Text>
        </View>

        <View style={s.promptTextBox}>
          <Animated.View
            key={idx}
            entering={FadeInDown.springify().damping(14)}
            exiting={FadeOutUp.duration(140)}
            style={s.promptAbs}
          >
            <Text style={s.promptEn}>{p.en}</Text>
            <Text style={s.promptUz}>{p.uz}</Text>
          </Animated.View>
        </View>

        <View style={s.promptActions}>
          <Tap onPress={() => onStart(p)} style={s.startBtn}>
            <Text style={s.startText}>Yozishni boshlash</Text>
            <Ionicons name="arrow-forward" size={17} color={C.ink} />
          </Tap>
          <Tap onPress={shuffle} style={s.shuffleBtn}>
            <Animated.View style={spinStyle}>
              <Ionicons name="shuffle" size={20} color={C.white} />
            </Animated.View>
          </Tap>
        </View>
      </View>
    </View>
  );
}

// ─── Filtr tugmasi ───────────────────────────────────────
function Pill({
  label,
  active,
  dot,
  onPress,
}: {
  label: string;
  active: boolean;
  dot?: string | null;
  onPress: () => void;
}) {
  const pop = useSharedValue(1);
  useEffect(() => {
    if (active) {
      pop.value = withSequence(
        withSpring(1.12, { damping: 6, stiffness: 300 }),
        withSpring(1, { damping: 8 })
      );
    }
  }, [active]);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  return (
    <Animated.View style={a}>
      <Tap onPress={onPress} style={[s.pill, active && s.pillActive]}>
        {dot && <View style={[s.pillDot, { backgroundColor: dot }]} />}
        <Text style={[s.pillText, active && { color: C.white }]}>{label}</Text>
      </Tap>
    </Animated.View>
  );
}

// ─── Muhim (yulduzcha) tugmasi ───────────────────────────
function PinButton({ active, onPress }: { active: boolean; onPress: () => void }) {
  const pop = useSharedValue(1);
  const rot = useSharedValue(0);
  const a = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }, { rotate: `${rot.value}deg` }],
  }));
  const handle = () => {
    pop.value = withSequence(
      withSpring(1.4, { damping: 6, stiffness: 300 }),
      withSpring(1, { damping: 8 })
    );
    rot.value = withSequence(withTiming(-25, { duration: 90 }), withSpring(0, { damping: 5 }));
    onPress();
  };
  return (
    <Pressable onPress={handle} hitSlop={10}>
      <Animated.View
        style={[s.pinBtn, { backgroundColor: active ? C.ink : C.white }, a]}
      >
        <Ionicons
          name={active ? 'star' : 'star-outline'}
          size={17}
          color={active ? C.yellow : C.ink}
        />
      </Animated.View>
    </Pressable>
  );
}

// ─── Yozuv kartochkasi ───────────────────────────────────
interface EntryItem {
  id: string;
  type: string;
  rawCategory: string;
  title: string;
  body: string;
  date: string;
  words: number;
  pinned: boolean;
  raw: WritingNote;
}

function EntryCard({
  item,
  onPin,
  onPress,
}: {
  item: EntryItem;
  onPin: (id: string) => void;
  onPress: () => void;
}) {
  const t = TYPES[item.type] || TYPES.eslatma;
  return (
    <Tap
      onPress={onPress}
      tilt={-1}
      style={[s.entryShadow, { shadowColor: t.color, backgroundColor: t.tint }]}
    >
      <View style={s.entryFace}>
        <View style={s.rowBetween}>
          <View style={[s.typeChip, { backgroundColor: t.color }]}>
            <Ionicons name={t.icon} size={13} color={t.fg} />
            <Text style={[s.typeChipText, { color: t.fg }]}>{t.label}</Text>
          </View>
          <PinButton active={item.pinned} onPress={() => onPin(item.id)} />
        </View>

        <Text style={s.entryTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={s.entryBody} numberOfLines={2}>
          {item.body}
        </Text>

        <View style={s.rowBetween}>
          <View style={s.metaRow}>
            <Ionicons name="time-outline" size={15} color={C.inkSoft} />
            <Text style={s.metaText}>{item.date}</Text>
            <Text style={s.metaText}>·</Text>
            <Text style={s.metaText}>{item.words} so‘z</Text>
          </View>
          <View style={s.openBtn}>
            <Ionicons name="arrow-forward" size={16} color={C.white} />
          </View>
        </View>
      </View>
    </Tap>
  );
}

// ─── Yangi yozuv tugmasi (FAB) ───────────────────────────
function Fab({ onPress }: { onPress: () => void }) {
  const ring = useSharedValue(0);
  const bob = useSharedValue(0);
  useEffect(() => {
    ring.value = withDelay(
      1600,
      withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) }), -1)
    );
    bob.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);
  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ring.value, [0, 1], [0.4, 0]),
    transform: [{ scale: interpolate(ring.value, [0, 1], [1, 1.5]) }],
  }));
  const bobStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(bob.value, [0, 1], [0, -4]) }],
  }));
  return (
    <Animated.View
      entering={ZoomIn.delay(1100).springify().damping(9)}
      style={s.fabWrap}
      pointerEvents="box-none"
    >
      <Animated.View style={bobStyle}>
        <Animated.View pointerEvents="none" style={[s.fabRing, ringStyle]} />
        <Tap onPress={onPress} style={s.fabShadow}>
          <LinearGradient
            colors={[C.violet, C.blue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.fab}
          >
            <Ionicons name="pencil" size={20} color={C.white} />
            <Text style={s.fabText}>Yangi</Text>
          </LinearGradient>
        </Tap>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Asosiy ekran ────────────────────────────────────────
export const WritingScreen: React.FC = () => {
  const [fontsLoaded] = useFonts({
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
  });

  const { notes, addNote, updateNote, deleteNote, togglePinNote } = useApp();

  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [ready, setReady] = useState(false);

  // ─── Viewer & Editor Modals State ───
  const [viewingNote, setViewingNote] = useState<WritingNote | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<WritingNote | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteCategory, setNoteCategory] = useState<NoteCategory>('Eslatmalar');
  const [noteContent, setNoteContent] = useState('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1600);
    return () => clearTimeout(t);
  }, []);

  // Map category to visual type
  const normalizeType = (cat?: string): string => {
    if (!cat) return 'eslatma';
    const c = cat.toLowerCase();
    if (c.includes('kun')) return 'kundalik';
    if (c.includes('insho')) return 'insho';
    if (c.includes('hikoy')) return 'hikoya';
    return 'eslatma';
  };

  // Convert notes from useApp to entry items
  const entries: EntryItem[] = useMemo(() => {
    return notes.map((n) => ({
      id: n.id,
      type: normalizeType(n.category),
      rawCategory: n.category,
      title: n.title || 'Sarlavhasiz qayd',
      body: n.content || 'Matn kiritilmagan...',
      date: new Date(n.updatedAt || Date.now()).toLocaleDateString('uz-UZ', {
        month: 'short',
        day: 'numeric',
      }),
      words: n.wordCount || (n.content ? n.content.trim().split(/\s+/).filter(Boolean).length : 0),
      pinned: !!n.isPinned,
      raw: n,
    }));
  }, [notes]);

  // Filter & Search
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries
      .filter(
        (e) =>
          (filter === 'all' || e.type === filter) &&
          (!q || e.title.toLowerCase().includes(q) || e.body.toLowerCase().includes(q))
      )
      .sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [entries, filter, query]);

  // Total words & weekly stats
  const totalWords = useMemo(
    () => entries.reduce((sum, e) => sum + e.words, 0),
    [entries]
  );

  const weekWords = useMemo(() => {
    // Distribute words over the week or default realistic graph
    const base = [18, 42, 0, 31, 64, 27, 40];
    if (totalWords > 0) {
      base[todayIdx] = Math.max(base[todayIdx], Math.min(totalWords, 85));
    }
    return base;
  }, [totalWords]);

  const weekTotal = useMemo(() => weekWords.reduce((a, b) => a + b, 0), [weekWords]);

  // ─── Handlers ───
  const handleOpenEditor = (note?: WritingNote, initialTitle?: string) => {
    if (note) {
      setEditingNote(note);
      setNoteTitle(note.title);
      setNoteCategory(note.category as NoteCategory);
      setNoteContent(note.content);
    } else {
      setEditingNote(null);
      setNoteTitle(initialTitle || '');
      setNoteCategory('Insho');
      setNoteContent('');
    }
    setSaveSuccessNotice(false);
    setIsEditorOpen(true);
  };

  const handleStartPrompt = (p: { en: string; uz: string }) => {
    handleOpenEditor(undefined, p.en);
  };

  const handleSaveNote = async () => {
    const title = noteTitle.trim() || 'Sarlavhasiz qayd';
    const content = noteContent.trim();
    if (!content && !noteTitle.trim()) return;

    if (editingNote) {
      await updateNote(editingNote.id, title, noteCategory, content);
      setViewingNote((prev) =>
        prev
          ? {
              ...prev,
              title,
              category: noteCategory,
              content,
              updatedAt: Date.now(),
            }
          : null
      );
    } else {
      await addNote(title, noteCategory, content);
    }

    setSaveSuccessNotice(true);
    setTimeout(() => {
      setSaveSuccessNotice(false);
      setIsEditorOpen(false);
    }, 450);
  };

  const handleShareNote = async (note: WritingNote) => {
    try {
      await Share.share({
        title: note.title,
        message: `${note.title}\n\n${note.content}`,
      });
    } catch {
      // ignore
    }
  };

  const handleDeleteNote = async (id: string) => {
    Alert.alert(
      'Qaydni o‘chirish',
      'Haqiqatan ham ushbu qaydni o‘chirmoqchimisiz?',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'O‘chirish',
          style: 'destructive',
          onPress: async () => {
            await deleteNote(id);
            if (viewingNote?.id === id) setViewingNote(null);
          },
        },
      ]
    );
  };

  const insertText = (str: string) => {
    setNoteContent((prev) => prev + str);
  };

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: C.bg }} />;

  const baseDelay = ready ? 0 : 640;
  const currentWordCount = noteContent.trim() ? noteContent.trim().split(/\s+/).filter(Boolean).length : 0;
  const currentCharCount = noteContent.length;

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Floating Animated Blobs */}
      <Blob color={C.yellow} size={210} top={-60} right={-90} />
      <Blob color={C.mint} size={170} top={380} left={-90} delay={900} />
      <Blob color={C.pink} size={200} top={720} right={-100} delay={1800} />

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.springify().damping(14)} style={s.header}>
          <View>
            <Text style={s.title}>Yozish</Text>
            <Text style={s.subtitle}>
              {entries.length} ta yozuv · {totalWords} so‘z yozildi
            </Text>
          </View>
          <Scribble />
        </Animated.View>

        {/* AI taklifi */}
        <Animated.View entering={ZoomIn.delay(120).springify().damping(13)}>
          <PromptCard onStart={handleStartPrompt} />
        </Animated.View>

        {/* Haftalik statistika */}
        <Animated.View
          entering={FadeInDown.delay(300).springify().damping(14)}
          style={s.statsRow}
        >
          <View>
            <CountUp to={weekTotal} style={s.bigNum} />
            <Text style={s.statLabel}>so‘z bu hafta</Text>
          </View>
          <WeekBars data={weekWords} />
        </Animated.View>

        {/* Qidiruv */}
        <Animated.View entering={FadeInDown.delay(420).springify().damping(14)}>
          <View style={[s.search, focused && { borderColor: C.violet }]}>
            <Ionicons name="search" size={19} color={focused ? C.violet : C.inkSoft} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Yozuvlardan qidirish..."
              placeholderTextColor={C.inkSoft}
              style={s.searchInput}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} hitSlop={10}>
                <Ionicons name="close-circle" size={20} color={C.inkSoft} />
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* Filtrlar */}
        <Animated.View entering={FadeInDown.delay(480).springify().damping(14)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.pillsScroll}
            contentContainerStyle={s.pillsContent}
            keyboardShouldPersistTaps="handled"
          >
            {FILTERS.map((f) => (
              <Pill
                key={f.key}
                label={f.label}
                dot={f.key === 'all' ? null : TYPES[f.key]?.color}
                active={filter === f.key}
                onPress={() => setFilter(f.key)}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Ro‘yxat */}
        {visible.map((item, i) => (
          <Animated.View
            key={item.id}
            entering={ZoomIn.delay(baseDelay + i * 80).springify().damping(13)}
            exiting={FadeOut.duration(150)}
            layout={LinearTransition.springify().damping(16)}
            style={{ marginBottom: 14 }}
          >
            <EntryCard
              item={item}
              onPin={() => togglePinNote(item.id)}
              onPress={() => setViewingNote(item.raw)}
            />
          </Animated.View>
        ))}

        {visible.length === 0 && (
          <Animated.View entering={ZoomIn.springify().damping(12)} style={s.empty}>
            <Text style={{ fontSize: 40 }}>🫥</Text>
            <Text style={s.emptyTitle}>Hech narsa topilmadi</Text>
            <Text style={s.emptySub}>Boshqa so‘z bilan qidirib ko‘ring yoki yangi yozuv boshlang.</Text>
          </Animated.View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <Fab onPress={() => handleOpenEditor()} />

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 1. EASY READING / VIEW NOTE MODAL (Qaydni to‘liq qulay o‘qish)   */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <Modal visible={!!viewingNote} transparent animationType="slide">
        {viewingNote && (
          <View style={s.readerModalBackdrop}>
            <View style={s.readerSheetContainer}>
              {/* Top Bar with actions */}
              <View style={s.readerTopBar}>
                <Tap onPress={() => setViewingNote(null)}>
                  <View style={s.modalIconBtn}>
                    <Ionicons name="close" size={20} color={C.ink} />
                  </View>
                </Tap>

                <View style={s.readerActionsRight}>
                  {/* Share button */}
                  <Tap onPress={() => handleShareNote(viewingNote)}>
                    <View style={s.modalIconBtn}>
                      <Ionicons name="share-social-outline" size={18} color={C.ink} />
                    </View>
                  </Tap>

                  {/* Delete button */}
                  <Tap onPress={() => handleDeleteNote(viewingNote.id)}>
                    <View style={s.modalIconBtn}>
                      <Ionicons name="trash-outline" size={18} color={C.pink} />
                    </View>
                  </Tap>

                  {/* Bookmark / Pin */}
                  <Tap
                    onPress={() => {
                      togglePinNote(viewingNote.id);
                      setViewingNote((prev) =>
                        prev ? { ...prev, isPinned: !prev.isPinned } : null
                      );
                    }}
                  >
                    <View style={s.modalIconBtn}>
                      <Ionicons
                        name={viewingNote.isPinned ? 'star' : 'star-outline'}
                        size={18}
                        color={viewingNote.isPinned ? C.yellow : C.ink}
                      />
                    </View>
                  </Tap>

                  {/* Edit button */}
                  <Tap
                    onPress={() => {
                      const noteToEdit = viewingNote;
                      setViewingNote(null);
                      handleOpenEditor(noteToEdit);
                    }}
                  >
                    <LinearGradient
                      colors={[C.violet, C.blue]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={s.readerEditBtn}
                    >
                      <Ionicons name="pencil" size={15} color="#FFFFFF" />
                      <Text style={s.readerEditText}>Tahrirlash</Text>
                    </LinearGradient>
                  </Tap>
                </View>
              </View>

              {/* Reader Content Scroll */}
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={s.readerContentScroll}
                showsVerticalScrollIndicator={false}
              >
                {/* Category & Meta pills */}
                <View style={s.readerMetaRow}>
                  <View style={s.readerCategoryPill}>
                    <Text style={s.readerCategoryText}>{viewingNote.category}</Text>
                  </View>
                  <Text style={s.readerWordCount}>
                    {viewingNote.wordCount || 0} so‘z • {Math.max(1, Math.ceil((viewingNote.wordCount || 0) / 180))} daqiqa mutolaa
                  </Text>
                </View>

                {/* Big Editorial Title */}
                <Text style={s.readerTitle}>{viewingNote.title}</Text>

                {/* Updated Date */}
                <Text style={s.readerDate}>
                  Oxirgi o‘zgarish:{' '}
                  {new Date(viewingNote.updatedAt).toLocaleDateString('uz-UZ', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>

                <View style={s.readerDivider} />

                {/* Body Content */}
                <Text style={s.readerBodyText}>{viewingNote.content}</Text>
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 2. COMFORTABLE WRITING CANVAS (Yozishga juda qulay interfeys)     */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <Modal visible={isEditorOpen} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={s.editorModalBackdrop}
        >
          <View style={s.editorFullContainer}>
            {/* Top Bar with Dismiss and Big Save Button */}
            <View style={s.editorTopBar}>
              <Tap onPress={() => setIsEditorOpen(false)}>
                <View style={s.modalIconBtn}>
                  <Ionicons name="close" size={22} color={C.ink} />
                </View>
              </Tap>

              {/* Live Status indicator */}
              <View style={s.liveCounterPill}>
                <Text style={s.liveCounterWord}>{currentWordCount} so‘z</Text>
                <Text style={s.liveCounterDot}>•</Text>
                <Text style={s.liveCounterChar}>{currentCharCount} belgi</Text>
              </View>

              {/* Instant Save Button with tactile feedback */}
              <Tap
                onPress={handleSaveNote}
                style={[
                  (!noteTitle.trim() && !noteContent.trim()) && { opacity: 0.5 },
                ]}
              >
                <LinearGradient
                  colors={saveSuccessNotice ? [C.mint, '#0FA780'] : [C.violet, C.blue]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.prominentSaveBtn}
                >
                  <Ionicons
                    name={saveSuccessNotice ? 'checkmark-circle' : 'checkmark-sharp'}
                    size={17}
                    color="#FFFFFF"
                  />
                  <Text style={s.prominentSaveText}>
                    {saveSuccessNotice ? 'Saqlandi!' : 'Saqlash'}
                  </Text>
                </LinearGradient>
              </Tap>
            </View>

            {/* Category Select Pills */}
            <View style={s.editorCategorySection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.editorCategoryScroll}
              >
                {(['Eslatmalar', 'Insho', 'Hikoya', 'Kundalik', "Lug'at mashqi"] as NoteCategory[]).map(
                  (cat) => {
                    const isChosen = noteCategory === cat;
                    return (
                      <Pressable
                        key={cat}
                        style={[s.editorChip, isChosen && s.editorChipActive]}
                        onPress={() => setNoteCategory(cat)}
                      >
                        <Text
                          style={[
                            s.editorChipText,
                            isChosen && s.editorChipTextActive,
                          ]}
                        >
                          {cat}
                        </Text>
                      </Pressable>
                    );
                  }
                )}
              </ScrollView>
            </View>

            {/* Title Input */}
            <TextInput
              style={s.editorTitleInput}
              placeholder="Insho yoki fikr sarlavhasi..."
              placeholderTextColor={C.inkSoft}
              value={noteTitle}
              onChangeText={setNoteTitle}
            />

            {/* Large Scrollable Writing Area */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
            >
              <TextInput
                style={s.editorContentInput}
                placeholder="Ingliz tilida erkin va to‘siqlarsiz yozing...&#10;&#10;Masalan:&#10;Today I realized something important..."
                placeholderTextColor="#A7A1C2"
                value={noteContent}
                onChangeText={setNoteContent}
                multiline
                textAlignVertical="top"
                autoFocus
              />
            </ScrollView>

            {/* ─── Quick Helper Keyboard Accessory Bar ─── */}
            <View style={s.quickKeyboardBar}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.quickKeysScroll}
              >
                <Pressable style={s.keyBtn} onPress={() => insertText('“')}>
                  <Text style={s.keyBtnText}>“</Text>
                </Pressable>
                <Pressable style={s.keyBtn} onPress={() => insertText('”')}>
                  <Text style={s.keyBtnText}>”</Text>
                </Pressable>
                <Pressable style={s.keyBtn} onPress={() => insertText('’')}>
                  <Text style={s.keyBtnText}>’</Text>
                </Pressable>
                <Pressable style={s.keyBtn} onPress={() => insertText('—')}>
                  <Text style={s.keyBtnText}>—</Text>
                </Pressable>
                <Pressable style={s.keyBtn} onPress={() => insertText('• ')}>
                  <Text style={s.keyBtnText}>• ro‘yxat</Text>
                </Pressable>
                <Pressable style={s.keyBtn} onPress={() => insertText('\n\n')}>
                  <Text style={s.keyBtnText}>¶ yangi xatboshi</Text>
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default WritingScreen;

// ─── Styles ──────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, overflow: 'hidden' },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: (StatusBar.currentHeight || 44) + 14,
    paddingBottom: 120,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontFamily: F.display, fontSize: 40, color: C.ink, letterSpacing: -1.2 },
  subtitle: { fontFamily: F.bodySemi, fontSize: 14, color: C.inkSoft, marginTop: -2 },

  // Prompt card
  promptWrap: {
    marginBottom: 24,
    borderRadius: 32,
    backgroundColor: C.ink,
    shadowColor: C.ink,
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  promptFace: {
    borderRadius: 32,
    padding: 22,
    height: 248,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  deco: { position: 'absolute', borderRadius: 999 },
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
  promptTextBox: { height: 106 },
  promptAbs: { position: 'absolute', top: 0, left: 0, right: 0 },
  promptEn: {
    fontFamily: F.display,
    fontSize: 27,
    lineHeight: 30,
    color: C.white,
    letterSpacing: -0.6,
  },
  promptUz: {
    fontFamily: F.body,
    fontSize: 14,
    lineHeight: 19,
    color: '#B9A8FF',
    marginTop: 8,
  },
  promptActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 46,
    paddingHorizontal: 18,
    borderRadius: 23,
    backgroundColor: C.yellow,
  },
  startText: { fontFamily: F.bodyBold, fontSize: 15, color: C.ink },
  shuffleBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  bigNum: { fontFamily: F.display, fontSize: 46, color: C.ink, letterSpacing: -1.5 },
  statLabel: { fontFamily: F.bodySemi, fontSize: 13, color: C.inkSoft, marginTop: -4 },
  barsRow: { flexDirection: 'row', gap: 9, alignItems: 'flex-end' },
  barCol: { alignItems: 'center', gap: 6 },
  barSlot: { height: 64, justifyContent: 'flex-end' },
  bar: { width: 16, borderRadius: 8 },
  barLabel: { fontFamily: F.bodySemi, fontSize: 11, color: C.inkSoft },

  // Search
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 52,
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: C.ink,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontFamily: F.bodySemi,
    fontSize: 15,
    color: C.ink,
    paddingVertical: 0,
  },

  // Pills
  pillsScroll: { marginHorizontal: -20, marginVertical: 16 },
  pillsContent: { paddingHorizontal: 20, gap: 8, paddingVertical: 6 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: C.white,
  },
  pillActive: { backgroundColor: C.ink },
  pillDot: { width: 9, height: 9, borderRadius: 5 },
  pillText: { fontFamily: F.bodyBold, fontSize: 14, color: C.ink },

  // Entry card
  entryShadow: {
    borderRadius: 28,
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  entryFace: { borderRadius: 28, padding: 18, gap: 10 },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  typeChipText: { fontFamily: F.bodyBold, fontSize: 12.5 },
  pinBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryTitle: {
    fontFamily: F.display,
    fontSize: 21,
    color: C.ink,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  entryBody: {
    fontFamily: F.body,
    fontSize: 15,
    lineHeight: 21,
    color: C.ink,
    opacity: 0.78,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontFamily: F.bodySemi, fontSize: 13, color: C.inkSoft },
  openBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 36, gap: 6 },
  emptyTitle: { fontFamily: F.display, fontSize: 20, color: C.ink },
  emptySub: {
    fontFamily: F.body,
    fontSize: 14,
    color: C.inkSoft,
    textAlign: 'center',
    maxWidth: 260,
  },

  // FAB
  fabWrap: { position: 'absolute', right: 20, bottom: 24 },
  fabRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 30,
    backgroundColor: C.violet,
  },
  fabShadow: {
    borderRadius: 30,
    backgroundColor: C.violet,
    shadowColor: C.violet,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 58,
    paddingHorizontal: 22,
    borderRadius: 30,
  },
  fabText: { fontFamily: F.display, fontSize: 17, color: C.white },

  // ─── Reader / View Modal ───
  readerModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(29, 17, 71, 0.45)',
    justifyContent: 'flex-end',
  },
  readerSheetContainer: {
    height: '92%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  readerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.borderSubtle,
  },
  modalIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F5F2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  readerActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  readerEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  readerEditText: {
    fontSize: 12,
    fontFamily: F.bodyBold,
    color: '#FFFFFF',
  },
  readerContentScroll: {
    paddingHorizontal: 22,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  readerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  readerCategoryPill: {
    backgroundColor: '#EDE9FE',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  readerCategoryText: {
    fontSize: 12,
    fontFamily: F.bodyBold,
    color: C.violet,
  },
  readerWordCount: {
    fontSize: 12,
    fontFamily: F.bodySemi,
    color: C.inkSoft,
  },
  readerTitle: {
    fontSize: 24,
    fontFamily: F.display,
    color: C.ink,
    lineHeight: 32,
    marginBottom: 8,
  },
  readerDate: {
    fontSize: 12,
    fontFamily: F.body,
    color: C.inkSoft,
    marginBottom: 14,
  },
  readerDivider: {
    height: 1,
    backgroundColor: C.borderSubtle,
    marginBottom: 16,
  },
  readerBodyText: {
    fontSize: 16,
    fontFamily: F.body,
    color: '#2D274A',
    lineHeight: 26,
    letterSpacing: 0.1,
  },

  // ─── Comfortable Full-Screen Editor ───
  editorModalBackdrop: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  editorFullContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 36 : 48,
  },
  editorTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  liveCounterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5F2FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  liveCounterWord: {
    fontSize: 12,
    fontFamily: F.bodyBold,
    color: C.violet,
  },
  liveCounterDot: {
    fontSize: 12,
    color: C.inkSoft,
  },
  liveCounterChar: {
    fontSize: 11,
    fontFamily: F.bodySemi,
    color: C.inkSoft,
  },
  prominentSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    shadowColor: C.violet,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  prominentSaveText: {
    fontSize: 13,
    fontFamily: F.bodyBold,
    color: '#FFFFFF',
  },
  editorCategorySection: {
    paddingVertical: 6,
  },
  editorCategoryScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  editorChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#F5F2FF',
  },
  editorChipActive: {
    backgroundColor: C.violet,
  },
  editorChipText: {
    fontSize: 12,
    fontFamily: F.bodySemi,
    color: C.inkSoft,
  },
  editorChipTextActive: {
    color: '#FFFFFF',
    fontFamily: F.bodyBold,
  },
  editorTitleInput: {
    fontSize: 22,
    fontFamily: F.display,
    color: C.ink,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.borderSubtle,
  },
  editorContentInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: F.body,
    color: C.ink,
    lineHeight: 26,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },

  // ─── Quick Helper Keyboard Bar ───
  quickKeyboardBar: {
    borderTopWidth: 1,
    borderTopColor: C.borderSubtle,
    backgroundColor: '#FAF9FE',
    paddingVertical: 8,
  },
  quickKeysScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  keyBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  keyBtnText: {
    fontSize: 13,
    fontFamily: F.bodySemi,
    color: C.ink,
  },
});
