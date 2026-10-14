// VocabularyScreen.tsx — Lug‘at Boyligi: Flesh-kartalar + Lug‘at Banki
// HomeScreen/WritingScreen/ReadingScreen bilan bir xil yorqin, animatsiyali dizayn tizimi

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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
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
  FadeIn,
  FadeOut,
  FadeInDown,
  FadeOutUp,
  ZoomIn,
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

import { useApp } from '../context/AppContext';
import { VocabFilter, VocabularyWord } from '../types';
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const rnd = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

// ─── Helpers & Micro-Interactions ─────────────────────────

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
  const a = (pt: any) =>
    useAnimatedStyle(() => ({
      opacity: interpolate(p.value, [0, 0.05, 0.7, 1], [0, 1, 1, 0]),
      transform: [
        { translateX: Math.cos(pt.a) * pt.d * p.value },
        { translateY: Math.sin(pt.a) * pt.d * p.value + 70 * p.value * p.value },
        { rotate: `${pt.r * p.value}deg` },
      ],
    }));
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
      {parts.map((pt, i) => (
        <Animated.View
          key={i}
          style={[
            { position: 'absolute', width: pt.sz, height: pt.sz * 0.6, borderRadius: 2, backgroundColor: pt.c },
            a(pt),
          ]}
        />
      ))}
    </View>
  );
}

// ─── Audio Pronunciation Helper ──────────────────────────
const speakWord = (text: string, rate: number = 1) => {
  Speech.speak(text, {
    language: 'en-US',
    rate,
    pitch: 1.0,
  });
};

// ─── Filter Pill ─────────────────────────────────────────
function Pill({
  label,
  active,
  dot,
  count,
  onPress,
}: {
  label: string;
  active: boolean;
  dot?: string | null;
  count?: number;
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
        {count !== undefined && (
          <View style={[s.pillCountBadge, active && { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
            <Text style={[s.pillCountText, active && { color: C.white }]}>{count}</Text>
          </View>
        )}
      </Tap>
    </Animated.View>
  );
}

// ─── Word Card Component (List Mode) ─────────────────────
function VocabCard({
  item,
  onToggleMastered,
  onToggleFavorite,
  onDelete,
}: {
  item: VocabularyWord;
  onToggleMastered: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Tap onPress={() => setExpanded(!expanded)} tilt={-0.5} style={s.cardShadow}>
      <View style={[s.cardFace, item.isMastered && s.cardFaceMastered]}>
        {/* Top Row: Word & Actions */}
        <View style={s.rowBetween}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {/* Audio Button */}
            <Tap
              onPress={() => speakWord(item.word, 1)}
              style={[s.audioCircle, { backgroundColor: item.isMastered ? '#E4FBF1' : '#F0ECFE' }]}
            >
              <Ionicons
                name="volume-high"
                size={18}
                color={item.isMastered ? C.mint : C.violet}
              />
            </Tap>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={s.cardWord}>{item.word}</Text>
                {item.partOfSpeech ? (
                  <View style={s.posBadge}>
                    <Text style={s.posBadgeText}>{item.partOfSpeech}</Text>
                  </View>
                ) : null}
              </View>
              {item.phonetic ? (
                <Text style={s.cardPhonetic}>{item.phonetic}</Text>
              ) : null}
            </View>
          </View>

          {/* Quick Actions (Favorite & Mastered) */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {/* Favorite / Heart */}
            <Pressable
              onPress={() => onToggleFavorite(item.id)}
              hitSlop={8}
              style={s.actionBtn}
            >
              <Ionicons
                name={item.isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={item.isFavorite ? C.pink : C.inkSoft}
              />
            </Pressable>

            {/* Checkmark Mastered */}
            <Pressable
              onPress={() => onToggleMastered(item.id)}
              hitSlop={8}
              style={[
                s.masteredBtn,
                item.isMastered && { backgroundColor: C.mint, borderColor: C.mint },
              ]}
            >
              <Ionicons
                name={item.isMastered ? 'checkmark' : 'checkmark-outline'}
                size={17}
                color={item.isMastered ? C.white : C.inkSoft}
              />
            </Pressable>
          </View>
        </View>

        {/* Translation */}
        <View style={s.translationRow}>
          <Text style={s.cardTranslation}>{item.translation}</Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={C.inkSoft}
          />
        </View>

        {/* Expanded Details: Context Sentence & Slow audio */}
        {expanded && (
          <Animated.View entering={FadeInDown.duration(200)} style={s.expandedBox}>
            {item.contextSentence ? (
              <View style={s.contextBox}>
                <Ionicons name="chatbubble-ellipses-outline" size={15} color={C.violet} />
                <Text style={s.contextText}>“{item.contextSentence}”</Text>
              </View>
            ) : null}

            {item.definition ? (
              <Text style={s.defText}>Izoh: {item.definition}</Text>
            ) : null}

            <View style={[s.rowBetween, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.borderSubtle }]}>
              {/* Slow audio button */}
              <Tap onPress={() => speakWord(item.word, 0.45)} style={s.slowBtn}>
                <Ionicons name="hourglass-outline" size={14} color={C.inkSoft} />
                <Text style={s.slowBtnText}>Sekin talaffuz</Text>
              </Tap>

              {/* Delete button */}
              <Pressable
                onPress={() => onDelete(item.id)}
                hitSlop={8}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <Ionicons name="trash-outline" size={15} color={C.pink} />
                <Text style={{ fontFamily: F.bodySemi, fontSize: 12, color: C.pink }}>
                  O‘chirish
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        )}
      </View>
    </Tap>
  );
}

// ─── Flashcard Training Deck (Cards Mode) ────────────────
function FlashcardDeck({
  words,
  onToggleMastered,
  onToggleFavorite,
  onCelebrate,
}: {
  words: VocabularyWord[];
  onToggleMastered: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onCelebrate: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const cur = words[index] || words[0];

  const handleNext = () => {
    setIsFlipped(false);
    setIndex((prev) => (prev < words.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setIndex((prev) => (prev > 0 ? prev - 1 : words.length - 1));
  };

  const handleMasterCurrent = () => {
    if (!cur) return;
    if (!cur.isMastered) {
      onToggleMastered(cur.id);
      onCelebrate();
    }
    handleNext();
  };

  if (!cur) {
    return (
      <View style={s.empty}>
        <Text style={{ fontSize: 44 }}>📭</Text>
        <Text style={s.emptyTitle}>So‘zlar mavjud emas</Text>
        <Text style={s.emptySub}>Ushbu toifada hozircha o‘rganish uchun so‘zlar yo‘q.</Text>
      </View>
    );
  }

  return (
    <View style={s.deckWrap}>
      {/* Top Deck Header: Counter & Audio */}
      <View style={[s.rowBetween, { marginBottom: 14 }]}>
        <View style={s.counterTag}>
          <Text style={s.counterText}>
            {index + 1} / {words.length}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Tap
            onPress={() => speakWord(cur.word, 1)}
            style={[s.iconCircle, { backgroundColor: '#F0ECFE' }]}
          >
            <Ionicons name="volume-high" size={20} color={C.violet} />
          </Tap>
          <Tap
            onPress={() => speakWord(cur.word, 0.45)}
            style={[s.iconCircle, { backgroundColor: '#FFF5E0' }]}
          >
            <Ionicons name="hourglass" size={17} color="#E58E00" />
          </Tap>
          <Tap
            onPress={() => onToggleFavorite(cur.id)}
            style={[s.iconCircle, { backgroundColor: cur.isFavorite ? '#FFEBF3' : '#F5F2FF' }]}
          >
            <Ionicons
              name={cur.isFavorite ? 'heart' : 'heart-outline'}
              size={19}
              color={cur.isFavorite ? C.pink : C.inkSoft}
            />
          </Tap>
        </View>
      </View>

      {/* Main Big Flashcard with Flip / Reveal */}
      <Tap
        onPress={() => setIsFlipped(!isFlipped)}
        tilt={-1}
        style={s.flashcardShadow}
      >
        <LinearGradient
          colors={
            isFlipped
              ? ['#FFFFFF', '#F8F6FF']
              : cur.isMastered
              ? ['#E7FBF3', '#FFFFFF']
              : ['#FFFFFF', '#FDFBFF']
          }
          style={s.flashcardFace}
        >
          {/* Card Top Meta */}
          <View style={s.rowBetween}>
            {cur.partOfSpeech ? (
              <View style={[s.posBadge, { backgroundColor: '#EDE8F8' }]}>
                <Text style={[s.posBadgeText, { color: C.violet }]}>
                  {cur.partOfSpeech.toUpperCase()}
                </Text>
              </View>
            ) : <View />}

            <View style={s.flipHintBadge}>
              <Ionicons name="sync-outline" size={13} color={C.inkSoft} />
              <Text style={s.flipHintText}>
                {isFlipped ? 'Yopish' : 'Tarjimani ochish'}
              </Text>
            </View>
          </View>

          {/* Center: English Word & Phonetic */}
          <View style={s.flashCenter}>
            <Text style={s.flashWord}>{cur.word}</Text>
            {cur.phonetic ? (
              <Text style={s.flashPhonetic}>{cur.phonetic}</Text>
            ) : null}

            {/* Revealed Meaning & Context */}
            {isFlipped ? (
              <Animated.View
                entering={FadeInDown.duration(200)}
                style={s.revealedWrap}
              >
                <View style={s.flashDivider} />
                <Text style={s.flashTranslation}>{cur.translation}</Text>

                {cur.contextSentence ? (
                  <View style={s.flashContextBox}>
                    <Text style={s.flashContextText}>“{cur.contextSentence}”</Text>
                  </View>
                ) : null}
              </Animated.View>
            ) : (
              <View style={s.tapToRevealPlaceholder}>
                <Ionicons name="sparkles" size={16} color={C.yellow} />
                <Text style={s.tapToRevealText}>
                  Tarjima va misolni ko‘rish uchun bosing
                </Text>
              </View>
            )}
          </View>

          {/* Bottom tag: Source & Mastered state */}
          <View style={s.rowBetween}>
            <Text style={s.flashSource}>
              {cur.sourceTitle || 'ReadScribe'}
            </Text>
            {cur.isMastered ? (
              <View style={s.masteredPill}>
                <Ionicons name="checkmark-circle" size={14} color={C.mint} />
                <Text style={s.masteredPillText}>Yodlangan</Text>
              </View>
            ) : null}
          </View>
        </LinearGradient>
      </Tap>

      {/* Flashcard Action Buttons */}
      <View style={s.deckActionsRow}>
        <Tap onPress={handlePrev} style={s.navBtn}>
          <Ionicons name="arrow-back" size={20} color={C.ink} />
        </Tap>

        <Tap onPress={handleNext} style={s.repeatBtn}>
          <Ionicons name="refresh" size={18} color={C.ink} />
          <Text style={s.repeatBtnText}>Takrorlash</Text>
        </Tap>

        <Tap onPress={handleMasterCurrent} style={s.masterBtn}>
          <LinearGradient
            colors={[C.mint, '#0EB388']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.masterBtnGrad}
          >
            <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
            <Text style={s.masterBtnText}>Yodlab bo‘ldim</Text>
          </LinearGradient>
        </Tap>

        <Tap onPress={handleNext} style={s.navBtn}>
          <Ionicons name="arrow-forward" size={20} color={C.ink} />
        </Tap>
      </View>
    </View>
  );
}

// ─── Add Word Bottom Sheet ───────────────────────────────
function AddWordSheet({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (word: string, translation: string, context: string) => void;
}) {
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [context, setContext] = useState('');

  // Auto-fill translation from dictionary if exists
  const handleWordChange = (val: string) => {
    setWord(val);
    const entry = findDictionaryEntry(val.trim());
    if (entry && !translation) {
      setTranslation(entry.translationUz);
      if (entry.example && !context) {
        setContext(entry.example);
      }
    }
  };

  const handleSave = () => {
    if (!word.trim()) return;
    onAdd(word.trim(), translation.trim(), context.trim());
    onClose();
  };

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
            <View>
              <Text style={s.addTitle}>Yangi so‘z qo‘shish</Text>
              <Text style={s.addSubTitle}>Lug‘at boyligingizni oshiring</Text>
            </View>
            <Tap onPress={onClose} style={s.sheetClose}>
              <Ionicons name="close" size={20} color={C.inkSoft} />
            </Tap>
          </View>

          <Text style={s.inputLabel}>INGLIZCHA SO‘Z</Text>
          <TextInput
            value={word}
            onChangeText={handleWordChange}
            placeholder="Masalan: Serendipity"
            placeholderTextColor={C.inkSoft}
            style={s.addInput}
            autoFocus
          />

          <Text style={s.inputLabel}>O‘ZBEKCHA TARJIMASI</Text>
          <TextInput
            value={translation}
            onChangeText={setTranslation}
            placeholder="Masalan: Baxtli tasodif"
            placeholderTextColor={C.inkSoft}
            style={s.addInput}
          />

          <Text style={s.inputLabel}>MISOL GAP (KONTEKST)</Text>
          <TextInput
            value={context}
            onChangeText={setContext}
            placeholder="Masalan: Finding this book was serendipity."
            placeholderTextColor={C.inkSoft}
            style={s.addInput}
          />

          <Tap onPress={handleSave} style={{ marginTop: 14 }}>
            <LinearGradient
              colors={[C.violet, C.blue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.addSubmitBtn}
            >
              <Ionicons name="add-circle" size={19} color="#FFFFFF" />
              <Text style={s.addSubmitText}>Lug‘atga qo‘shish</Text>
            </LinearGradient>
          </Tap>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Asosiy Ekran ────────────────────────────────────────
export interface VocabularyScreenProps {
  onBack?: () => void;
}

export const VocabularyScreen: React.FC<VocabularyScreenProps> = () => {
  const [fontsLoaded] = useFonts({
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
  });

  const {
    vocabulary,
    addWordToVocab,
    removeWordFromVocab,
    toggleMastered,
    toggleFavorite,
  } = useApp();

  const [mode, setMode] = useState<'cards' | 'list'>('cards');
  const [filter, setFilter] = useState<VocabFilter>('Barchasi');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [burst, setBurst] = useState(0);

  const filterTabs: VocabFilter[] = ['Barchasi', "O'rganilmoqda", 'Yodlandi', 'Sevimlilar'];

  // Word statistics
  const totalCount = vocabulary.length;
  const masteredCount = vocabulary.filter((w) => w.isMastered).length;
  const learningCount = vocabulary.filter((w) => !w.isMastered).length;
  const favoriteCount = vocabulary.filter((w) => w.isFavorite).length;
  const masterPercent = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  // Filtered words
  const filteredWords = useMemo(() => {
    return vocabulary.filter((item) => {
      const matchesFilter =
        filter === 'Barchasi'
          ? true
          : filter === "O'rganilmoqda"
          ? !item.isMastered
          : filter === 'Yodlandi'
          ? item.isMastered
          : filter === 'Sevimlilar'
          ? item.isFavorite
          : true;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.word.toLowerCase().includes(q) ||
        item.translation.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [vocabulary, filter, searchQuery]);

  const handleAddWord = async (word: string, translation: string, context: string) => {
    await addWordToVocab(word, context, 'Lug‘at orqali qo‘shildi');
  };

  const handleDeleteWord = (id: string) => {
    Alert.alert(
      'So‘zni o‘chirish',
      'Ushbu so‘zni lug‘atingizdan olib tashlamoqchimisiz?',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'O‘chirish',
          style: 'destructive',
          onPress: () => removeWordFromVocab(id),
        },
      ]
    );
  };

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: C.bg }} />;

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Floating Animated Blobs */}
      <Blob color={C.mint} size={220} top={-70} right={-80} />
      <Blob color={C.yellow} size={180} top={400} left={-90} delay={1000} />
      <Blob color={C.pink} size={200} top={750} right={-100} delay={1800} />

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.springify().damping(14)} style={s.header}>
          <View>
            <Text style={s.title}>Lug‘at Boyligi</Text>
            <Text style={s.subtitle}>
              {totalCount} ta so‘z · {masteredCount} tasi yodlangan ({masterPercent}%)
            </Text>
          </View>
          <Wiggle emoji="🧠" />
        </Animated.View>

        {/* Hero Mastery Progress Banner */}
        <Animated.View entering={ZoomIn.delay(120).springify().damping(13)}>
          <View style={s.heroShadow}>
            <LinearGradient
              colors={[C.ink, '#2B1B69']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.heroFace}
            >
              <View style={[s.deco, { width: 140, height: 140, top: -40, right: -40, backgroundColor: C.violet }]} />
              <View style={[s.deco, { width: 40, height: 40, top: 30, right: 90, backgroundColor: C.mint }]} />

              <View style={s.chipDark}>
                <Ionicons name="sparkles" size={13} color={C.yellow} />
                <Text style={s.chipDarkText}>Lug‘at rivoji</Text>
              </View>

              <View>
                <View style={s.rowBetween}>
                  <Text style={s.heroTitle}>{masteredCount} / {totalCount} so‘z</Text>
                  <Text style={s.heroPercent}>{masterPercent}%</Text>
                </View>

                {/* Progress bar */}
                <View style={s.heroTrack}>
                  <View style={[s.heroFill, { width: `${Math.max(masterPercent, 4)}%` }]} />
                </View>
              </View>

              {/* 3 Stats Chips inside Hero */}
              <View style={s.heroStatsRow}>
                <View style={s.heroStatChip}>
                  <View style={[s.heroStatDot, { backgroundColor: C.mint }]} />
                  <Text style={s.heroStatText}>{masteredCount} Yodlangan</Text>
                </View>
                <View style={s.heroStatChip}>
                  <View style={[s.heroStatDot, { backgroundColor: C.yellow }]} />
                  <Text style={s.heroStatText}>{learningCount} O‘rganilmoqda</Text>
                </View>
                <View style={s.heroStatChip}>
                  <View style={[s.heroStatDot, { backgroundColor: C.pink }]} />
                  <Text style={s.heroStatText}>{favoriteCount} Sevimli</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Mode Switcher: Flesh-kartalar vs Lug'at Banki */}
        <Animated.View entering={FadeInDown.delay(240).springify().damping(14)} style={s.modeSwitcherRow}>
          <Tap
            onPress={() => setMode('cards')}
            style={[s.modeBtn, mode === 'cards' && s.modeBtnActive]}
          >
            <Ionicons
              name="albums"
              size={18}
              color={mode === 'cards' ? C.white : C.inkSoft}
            />
            <Text style={[s.modeBtnText, mode === 'cards' && s.modeBtnTextActive]}>
              Flesh-kartalar
            </Text>
          </Tap>

          <Tap
            onPress={() => setMode('list')}
            style={[s.modeBtn, mode === 'list' && s.modeBtnActive]}
          >
            <Ionicons
              name="list"
              size={19}
              color={mode === 'list' ? C.white : C.inkSoft}
            />
            <Text style={[s.modeBtnText, mode === 'list' && s.modeBtnTextActive]}>
              Lug‘at Banki
            </Text>
          </Tap>
        </Animated.View>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* MODE 1: FLESH-KARTALAR O‘YINI / MASHG‘ULOT               */}
        {/* ══════════════════════════════════════════════════════════ */}
        {mode === 'cards' ? (
          <Animated.View entering={FadeIn.duration(260)}>
            <FlashcardDeck
              words={filteredWords}
              onToggleMastered={toggleMastered}
              onToggleFavorite={toggleFavorite}
              onCelebrate={() => setBurst((b) => b + 1)}
            />
          </Animated.View>
        ) : (
          /* ══════════════════════════════════════════════════════════ */
          /* MODE 2: LUG‘AT BANKI / RO‘YXAT REJIMI                    */
          /* ══════════════════════════════════════════════════════════ */
          <Animated.View entering={FadeIn.duration(260)}>
            {/* Search Input */}
            <View style={s.searchBar}>
              <Ionicons name="search" size={19} color={C.inkSoft} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Inglizcha yoki o‘zbekcha qidirish..."
                placeholderTextColor={C.inkSoft}
                style={s.searchInput}
              />
              {searchQuery ? (
                <Pressable onPress={() => setSearchQuery('')} hitSlop={10}>
                  <Ionicons name="close-circle" size={19} color={C.inkSoft} />
                </Pressable>
              ) : null}
            </View>

            {/* Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginHorizontal: -20, marginVertical: 14 }}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
            >
              {filterTabs.map((tab) => {
                const count =
                  tab === 'Barchasi'
                    ? totalCount
                    : tab === "O'rganilmoqda"
                    ? learningCount
                    : tab === 'Yodlandi'
                    ? masteredCount
                    : favoriteCount;

                const dot =
                  tab === 'Yodlandi'
                    ? C.mint
                    : tab === "O'rganilmoqda"
                    ? C.yellow
                    : tab === 'Sevimlilar'
                    ? C.pink
                    : null;

                return (
                  <Pill
                    key={tab}
                    label={tab}
                    active={filter === tab}
                    dot={dot}
                    count={count}
                    onPress={() => setFilter(tab)}
                  />
                );
              })}
            </ScrollView>

            {/* Add Word Quick Tile */}
            <Tap onPress={() => setIsAddOpen(true)} style={s.addWordTile}>
              <View style={s.addWordIcon}>
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.addWordTileTitle}>Yangi so‘z qo‘shish</Text>
                <Text style={s.addWordTileSub}>
                  O‘zingiz bilmagan so‘zlarni lug‘atga kiriting
                </Text>
              </View>
            </Tap>

            {/* Words List */}
            <View style={{ gap: 12, marginTop: 14 }}>
              {filteredWords.map((item) => (
                <VocabCard
                  key={item.id}
                  item={item}
                  onToggleMastered={toggleMastered}
                  onToggleFavorite={toggleFavorite}
                  onDelete={handleDeleteWord}
                />
              ))}

              {filteredWords.length === 0 ? (
                <View style={s.empty}>
                  <Text style={{ fontSize: 40 }}>🔍</Text>
                  <Text style={s.emptyTitle}>Hech narsa topilmadi</Text>
                  <Text style={s.emptySub}>
                    Boshqa so‘z bilan qidiring yoki yangi so‘z qo‘shing.
                  </Text>
                </View>
              ) : null}
            </View>
          </Animated.View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Floating Confetti effect */}
      <Confetti burst={burst} />

      {/* Add Word Modal */}
      {isAddOpen && (
        <AddWordSheet
          onClose={() => setIsAddOpen(false)}
          onAdd={handleAddWord}
        />
      )}
    </View>
  );
};

export default VocabularyScreen;

// ─── Styles ──────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, overflow: 'hidden' },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: (StatusBar.currentHeight || 44) + 14,
    paddingBottom: 60,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deco: { position: 'absolute', borderRadius: 999 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontFamily: F.display, fontSize: 38, color: C.ink, letterSpacing: -1.2 },
  subtitle: { fontFamily: F.bodySemi, fontSize: 14, color: C.inkSoft, marginTop: -2 },

  // Hero Mastery Progress Banner
  heroShadow: {
    borderRadius: 30,
    backgroundColor: C.ink,
    shadowColor: C.ink,
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  heroFace: {
    borderRadius: 30,
    padding: 22,
    height: 220,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
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
  heroTitle: { fontFamily: F.display, fontSize: 26, color: C.white, letterSpacing: -0.5 },
  heroPercent: { fontFamily: F.display, fontSize: 26, color: C.mint },
  heroTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.16)',
    marginTop: 8,
    overflow: 'hidden',
  },
  heroFill: { height: '100%', borderRadius: 5, backgroundColor: C.mint },
  heroStatsRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  heroStatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  heroStatDot: { width: 8, height: 8, borderRadius: 4 },
  heroStatText: { fontFamily: F.bodySemi, fontSize: 11.5, color: C.white },

  // Mode Switcher
  modeSwitcherRow: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 5,
    marginTop: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.ink,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: 16,
  },
  modeBtnActive: {
    backgroundColor: C.ink,
  },
  modeBtnText: {
    fontFamily: F.bodySemi,
    fontSize: 14,
    color: C.inkSoft,
  },
  modeBtnTextActive: {
    fontFamily: F.bodyBold,
    color: C.white,
  },

  // Flashcard Deck (Cards Mode)
  deckWrap: {
    marginTop: 4,
  },
  counterTag: {
    backgroundColor: C.white,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  counterText: { fontFamily: F.displayMd, fontSize: 14, color: C.ink },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashcardShadow: {
    borderRadius: 32,
    backgroundColor: C.white,
    shadowColor: C.violet,
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  flashcardFace: {
    borderRadius: 32,
    padding: 24,
    minHeight: 330,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: C.border,
  },
  posBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#F0ECFE',
  },
  posBadgeText: { fontFamily: F.bodyBold, fontSize: 11, color: C.violet },
  flipHintBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  flipHintText: { fontFamily: F.bodySemi, fontSize: 12, color: C.inkSoft },
  flashCenter: { alignItems: 'center', marginVertical: 20 },
  flashWord: {
    fontFamily: F.display,
    fontSize: 38,
    color: C.ink,
    letterSpacing: -1,
    textAlign: 'center',
  },
  flashPhonetic: {
    fontFamily: F.bodySemi,
    fontSize: 16,
    color: C.inkSoft,
    marginTop: 4,
  },
  revealedWrap: { alignItems: 'center', width: '100%' },
  flashDivider: {
    width: '60%',
    height: 1,
    backgroundColor: C.border,
    marginVertical: 14,
  },
  flashTranslation: {
    fontFamily: F.display,
    fontSize: 26,
    color: C.violet,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  flashContextBox: {
    marginTop: 12,
    backgroundColor: '#F5F2FF',
    borderRadius: 16,
    padding: 12,
    width: '100%',
  },
  flashContextText: {
    fontFamily: F.body,
    fontSize: 14,
    lineHeight: 20,
    color: C.ink,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  tapToRevealPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 22,
    backgroundColor: '#F9F8FD',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  tapToRevealText: {
    fontFamily: F.bodySemi,
    fontSize: 13,
    color: C.inkSoft,
  },
  flashSource: { fontFamily: F.bodySemi, fontSize: 12, color: C.inkSoft },
  masteredPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E7FBF3',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  masteredPillText: { fontFamily: F.bodyBold, fontSize: 11.5, color: C.mint },

  // Flashcard Deck Actions
  deckActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
  },
  navBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatBtn: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  repeatBtnText: { fontFamily: F.bodyBold, fontSize: 14, color: C.ink },
  masterBtn: {
    flex: 1.3,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: C.mint,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  masterBtnGrad: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
  },
  masterBtnText: { fontFamily: F.bodyBold, fontSize: 14, color: '#FFFFFF' },

  // List Mode: Search & Pills
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.ink,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontFamily: F.bodySemi,
    fontSize: 14.5,
    color: C.ink,
    paddingVertical: 0,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
  },
  pillActive: { backgroundColor: C.ink, borderColor: C.ink },
  pillDot: { width: 8, height: 8, borderRadius: 4 },
  pillText: { fontFamily: F.bodyBold, fontSize: 13, color: C.ink },
  pillCountBadge: {
    backgroundColor: '#F0ECFE',
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 10,
  },
  pillCountText: { fontFamily: F.bodyBold, fontSize: 11, color: C.violet },

  // Add Word Tile
  addWordTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 22,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: C.violet,
    backgroundColor: 'rgba(124,77,255,0.06)',
    marginTop: 6,
  },
  addWordIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: C.violet,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-6deg' }],
  },
  addWordTileTitle: { fontFamily: F.displayMd, fontSize: 16.5, color: C.ink },
  addWordTileSub: { fontFamily: F.body, fontSize: 12.5, color: C.inkSoft, marginTop: 1 },

  // Vocab Card (List)
  cardShadow: {
    borderRadius: 24,
    backgroundColor: C.white,
    shadowColor: C.ink,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  cardFace: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardFaceMastered: {
    borderColor: '#C6F5E3',
    backgroundColor: '#FAFDFB',
  },
  audioCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWord: { fontFamily: F.display, fontSize: 20, color: C.ink, letterSpacing: -0.4 },
  cardPhonetic: { fontFamily: F.bodySemi, fontSize: 13, color: C.inkSoft, marginTop: 1 },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F5F2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  masteredBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F5F2FF',
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  translationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.borderSubtle,
  },
  cardTranslation: { fontFamily: F.bodyBold, fontSize: 16, color: C.violet },
  expandedBox: { marginTop: 12, gap: 8 },
  contextBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F5F2FF',
    padding: 10,
    borderRadius: 14,
  },
  contextText: { fontFamily: F.body, fontSize: 13.5, color: C.ink, flex: 1, lineHeight: 18 },
  defText: { fontFamily: F.body, fontSize: 13, color: C.inkSoft, marginTop: 4 },
  slowBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  slowBtnText: { fontFamily: F.bodySemi, fontSize: 12.5, color: C.inkSoft },

  // Empty state
  empty: { alignItems: 'center', paddingVertical: 40, gap: 6 },
  emptyTitle: { fontFamily: F.display, fontSize: 20, color: C.ink },
  emptySub: { fontFamily: F.body, fontSize: 13.5, color: C.inkSoft, textAlign: 'center', maxWidth: 280 },

  // Add Sheet
  addSheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 36,
  },
  addTitle: { fontFamily: F.display, fontSize: 24, color: C.ink, letterSpacing: -0.5 },
  addSubTitle: { fontFamily: F.body, fontSize: 13, color: C.inkSoft, marginTop: 2 },
  sheetClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontFamily: F.bodyBold,
    fontSize: 11,
    color: C.inkSoft,
    letterSpacing: 1,
    marginTop: 14,
    marginBottom: 6,
  },
  addInput: {
    backgroundColor: C.bg,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: F.bodySemi,
    fontSize: 15,
    color: C.ink,
  },
  addSubmitBtn: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addSubmitText: { fontFamily: F.bodyBold, fontSize: 15, color: '#FFFFFF' },
});
