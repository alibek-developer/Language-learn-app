// ProfileScreen.tsx — Shaxsiy Hisob: Yutuqlar, Daraja, Avatarlar, Faollik va AI Integratsiyasi
// HomeScreen/WritingScreen/ReadingScreen bilan bir xil dizayn tizimi

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  FadeInDown,
} from "react-native-reanimated";
import { useApp } from "../context/AppContext";
import { StorageService } from "../services/storage";
import { C, F } from "../theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Interactive Tactile Button Component ────────────────────
const Tap: React.FC<{
  onPress?: () => void;
  style?: any;
  children: React.ReactNode;
}> = ({ onPress, style, children }) => {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.95, { damping: 15, stiffness: 350 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 350 });
      }}
      style={[style, animStyle]}
    >
      {children}
    </AnimatedPressable>
  );
};

// ─── Smooth Animated Switch ─────────────────────────────────
const AnimatedSwitch: React.FC<{
  value: boolean;
  onValueChange: (val: boolean) => void;
}> = ({ value, onValueChange }) => {
  const offset = useSharedValue(value ? 22 : 2);

  useEffect(() => {
    offset.value = withSpring(value ? 22 : 2, { damping: 16, stiffness: 300 });
  }, [value]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={[
        styles.switchTrack,
        value ? styles.switchTrackActive : styles.switchTrackInactive,
      ]}
    >
      <Animated.View style={[styles.switchThumb, thumbStyle]} />
    </Pressable>
  );
};

// ─── Flame Streak Animation ──────────────────────────────────
const PulsingFlame: React.FC<{ streak: number }> = ({ streak }) => {
  const flameScale = useSharedValue(1);

  useEffect(() => {
    flameScale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 800 }),
        withTiming(1.0, { duration: 800 }),
      ),
      -1,
      true,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
  }));

  return (
    <Animated.View style={[styles.streakBadge, animStyle]}>
      <LinearGradient
        colors={["#FF8E53", "#FF5252"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.streakGradient}
      >
        <Ionicons name="flame" size={16} color="#FFFFFF" />
        <Text style={styles.streakText}>{streak} kun</Text>
      </LinearGradient>
    </Animated.View>
  );
};

// ─── CEFR Levels Definition ──────────────────────────────────
const CEFR_LEVELS = [
  {
    level: "A1",
    name: "Boshlang‘ich",
    desc: "Oddiy iboralar va eng asosiy so‘zlar",
  },
  { level: "A2", name: "Asosiy", desc: "Kundalik mavzular va oddiy muloqot" },
  {
    level: "B1",
    name: "O‘rta daraja",
    desc: "Erkin mutolaa va fikr bayon qilish",
  },
  {
    level: "B2",
    name: "Kuchli O‘rta",
    desc: "Murakkab matnlar va kitoblar tahlili",
  },
  {
    level: "C1",
    name: "Ilg‘or (Advanced)",
    desc: "Akademik va professional til darajasi",
  },
];

const AVATAR_OPTIONS = [
  "🎓",
  "🦉",
  "🦊",
  "🦁",
  "🚀",
  "⚡",
  "👑",
  "🌟",
  "💎",
  "🎨",
  "🔥",
  "📚",
];

// ─── Asosiy Profil Ekrani ────────────────────────────────────
export const ProfileScreen: React.FC = () => {
  const {
    profile,
    updateProfile,
    vocabulary,
    readings,
    notes,
    settings,
    updateSettings,
  } = useApp();

  // Modals state
  const [isEditingName, setIsEditingName] = useState(false);
  const [userName, setUserName] = useState(profile.name || "Alibek");
  const [dailyGoal, setDailyGoal] = useState(
    (profile.dailyGoalMinutes || 15).toString(),
  );
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<any>(null);

  // Gemini API Key state
  const [apiKey, setApiKey] = useState("");
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  useEffect(() => {
    StorageService.getApiKey().then((k) => setApiKey(k || ""));
  }, []);

  useEffect(() => {
    setUserName(profile.name || "Alibek");
    setDailyGoal((profile.dailyGoalMinutes || 15).toString());
  }, [profile.name, profile.dailyGoalMinutes]);

  const handleSaveProfile = async () => {
    const parsedGoal = parseInt(dailyGoal, 10);
    await updateProfile({
      name: userName.trim() || "O‘rganuvchi",
      dailyGoalMinutes: isNaN(parsedGoal) || parsedGoal <= 0 ? 15 : parsedGoal,
    });
    setIsEditingName(false);
  };

  const handleSelectLevel = async (level: string, levelName: string) => {
    await updateProfile({ level, levelName });
    setIsLevelModalOpen(false);
  };

  const handleSelectAvatar = async (avatar: string) => {
    await updateProfile({ avatarSeed: avatar });
    setIsAvatarModalOpen(false);
  };

  const handleSaveApiKey = async () => {
    await StorageService.saveApiKey(apiKey.trim());
    setIsApiKeyModalOpen(false);
  };

  // Stats calculation
  const masteredCount = vocabulary.filter((v) => v.isMastered).length;
  const finishedReadingsCount = readings.filter((r) => r.isFinished).length;
  const currentStreak = profile.streakDays || 7;
  const currentLevel = profile.level || "B1";
  const currentLevelName = profile.levelName || "O‘rta daraja";
  const currentAvatar = profile.avatarSeed || "🎓";

  // Badges calculation
  const BADGES = [
    {
      id: "streak",
      title: "Olovli Iroda",
      desc: "7 kun uzluksiz o‘qish streakiga erishildi",
      emoji: "🔥",
      color: "#FF7675",
      unlocked: currentStreak >= 7,
      progress: `${Math.min(currentStreak, 7)}/7 kun`,
      xp: "+50 XP",
    },
    {
      id: "books",
      title: "Kitob Qurt",
      desc: "Kutubxonadagi asarlarni muvaffaqiyatli tugatildi",
      emoji: "📚",
      color: C.blue,
      unlocked: finishedReadingsCount >= 1,
      progress: `${finishedReadingsCount}/1 asar`,
      xp: "+60 XP",
    },
    {
      id: "vocab",
      title: "So‘z Ustasi",
      desc: "Lug‘atda kamida 5 ta so‘z to‘liq yodlandi",
      emoji: "⚡",
      color: C.mint,
      unlocked: masteredCount >= 5,
      progress: `${masteredCount}/5 so‘z`,
      xp: "+40 XP",
    },
    {
      id: "writer",
      title: "Ijodkor Muallif",
      desc: "Yozish maydonida kamida 2 ta insho yoki qayd bitildi",
      emoji: "✍️",
      color: C.pink,
      unlocked: notes.length >= 2,
      progress: `${notes.length}/2 qayd`,
      xp: "+50 XP",
    },
    {
      id: "time",
      title: "Vaqt Qahramoni",
      desc: "Ilovada 30 daqiqadan ko‘proq mutolaa qilindi",
      emoji: "⏱️",
      color: C.violet,
      unlocked: (profile.totalMinutesRead || 0) >= 30,
      progress: `${profile.totalMinutesRead || 0}/30 daqiqa`,
      xp: "+70 XP",
    },
    {
      id: "polyglot",
      title: "Faol Poliglot",
      desc: "Lug‘at boyligiga 15 tadan ko‘p so‘z kiritildi",
      emoji: "🌟",
      color: C.yellow,
      unlocked: vocabulary.length >= 15,
      progress: `${vocabulary.length}/15 so‘z`,
      xp: "+80 XP",
    },
  ];

  const unlockedBadgesCount = BADGES.filter((b) => b.unlocked).length;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Row */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.headerRow}
        >
          <View>
            <Text style={styles.headerSubtitle}>SHAXSIY HISOB</Text>
            <Text style={styles.headerTitle}>Mening Profilim</Text>
          </View>
          <Tap onPress={() => setIsEditingName(true)}>
            <View style={styles.editBtnPill}>
              <Ionicons name="pencil" size={15} color={C.violet} />
              <Text style={styles.editBtnText}>Tahrirlash</Text>
            </View>
          </Tap>
        </Animated.View>

        {/* ─── Hero User Card ─── */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.heroCardContainer}
        >
          <LinearGradient
            colors={[C.violet, "#4E54C8", C.blue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroBgCircle1} />
            <View style={styles.heroBgCircle2} />

            <View style={styles.heroTopRow}>
              {/* Avatar with tap-to-change */}
              <Tap onPress={() => setIsAvatarModalOpen(true)}>
                <View style={styles.avatarWrapper}>
                  <View style={styles.avatarInner}>
                    <Text style={{ fontSize: 32 }}>{currentAvatar}</Text>
                  </View>
                  <View style={styles.avatarBadge}>
                    <Ionicons name="camera" size={11} color="#FFFFFF" />
                  </View>
                </View>
              </Tap>

              {/* User meta */}
              <View style={styles.heroMeta}>
                <Text style={styles.heroName} numberOfLines={1}>
                  {profile.name || "Alibek men"}
                </Text>

                {/* Level selector pill */}
                <Tap onPress={() => setIsLevelModalOpen(true)}>
                  <View style={styles.levelTag}>
                    <Text style={styles.levelTagText}>
                      {currentLevel} • {currentLevelName}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={12}
                      color="#FFFFFF"
                    />
                  </View>
                </Tap>
              </View>

              {/* Streak Flame */}
              <PulsingFlame streak={currentStreak} />
            </View>

            {/* Daily Goal Row */}
            <View style={styles.heroGoalRow}>
              <View style={styles.goalIconCircle}>
                <Ionicons name="timer-outline" size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.goalLabel}>KUNLIK MUTOLAA REJASI</Text>
                <Text style={styles.goalValue}>
                  {profile.dailyGoalMinutes || 15} daqiqa rejalashtirilgan
                </Text>
              </View>
              <Tap onPress={() => setIsEditingName(true)}>
                <View style={styles.changeGoalPill}>
                  <Text style={styles.changeGoalText}>O‘zgartirish</Text>
                </View>
              </Tap>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ─── 1. Weekly Activity Matrix & Heatmap ─── */}
        <Animated.View
          entering={FadeInDown.delay(180).duration(450)}
          style={styles.sectionWrap}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEyebrow}>FAOLLIK GRAFIGI</Text>
            <Text style={styles.sectionTitle}>
              Haftalik Faollik & O‘qish Tezligi
            </Text>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.weekRow}>
              {[
                { day: "Du", done: true, mins: "20m" },
                { day: "Se", done: true, mins: "15m" },
                { day: "Ch", done: true, mins: "30m" },
                { day: "Pa", done: true, mins: "18m" },
                { day: "Ju", done: true, mins: "25m" },
                { day: "Sh", done: true, mins: "15m" },
                { day: "Ya", done: true, today: true, mins: "22m" },
              ].map((d, i) => (
                <View key={i} style={styles.dayCol}>
                  <View
                    style={[
                      styles.dayDot,
                      d.done ? styles.dayDotActive : styles.dayDotInactive,
                      d.today && styles.dayDotToday,
                    ]}
                  >
                    <Ionicons
                      name={d.done ? "checkmark" : "ellipse-outline"}
                      size={14}
                      color={d.done ? "#FFFFFF" : C.inkSoft}
                    />
                  </View>
                  <Text
                    style={[
                      styles.dayLabel,
                      d.today && { color: C.violet, fontFamily: F.bodyBold },
                    ]}
                  >
                    {d.day}
                  </Text>
                  <Text style={styles.dayMins}>{d.mins}</Text>
                </View>
              ))}
            </View>

            <View style={styles.activityStatsDivider} />

            <View style={styles.activitySummaryRow}>
              <View style={styles.activitySummaryCol}>
                <Text style={styles.actSumVal}>🔥 7 kun</Text>
                <Text style={styles.actSumLabel}>Uzluksiz streak</Text>
              </View>
              <View style={styles.actSumSep} />
              <View style={styles.activitySummaryCol}>
                <Text style={styles.actSumVal}>⚡ ~175 WPM</Text>
                <Text style={styles.actSumLabel}>O‘qish tezligi</Text>
              </View>
              <View style={styles.actSumSep} />
              <View style={styles.activitySummaryCol}>
                <Text style={styles.actSumVal}>🎯 100%</Text>
                <Text style={styles.actSumLabel}>Maqsad bajarildi</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ─── 2. Achievements & Badges System ─── */}
        <Animated.View
          entering={FadeInDown.delay(240).duration(450)}
          style={styles.sectionWrap}
        >
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.sectionEyebrow}>YUTUQLAR & MUKOFOTLAR</Text>
              <Text style={styles.sectionTitle}>Nishonlar Kolleksiyasi</Text>
            </View>
            <View style={styles.badgeCountChip}>
              <Ionicons name="trophy" size={14} color={C.yellow} />
              <Text style={styles.badgeCountText}>
                {unlockedBadgesCount} / {BADGES.length}
              </Text>
            </View>
          </View>

          <View style={styles.badgesGrid}>
            {BADGES.map((b) => (
              <Tap
                key={b.id}
                onPress={() => setSelectedBadge(b)}
                style={{ width: "31%" }}
              >
                <View
                  style={[
                    styles.badgeCard,
                    !b.unlocked && styles.badgeCardLocked,
                  ]}
                >
                  <View
                    style={[
                      styles.badgeIconCircle,
                      {
                        backgroundColor: b.unlocked
                          ? b.color + "22"
                          : "#F0ECFA",
                      },
                    ]}
                  >
                    <Text
                      style={{ fontSize: 28, opacity: b.unlocked ? 1 : 0.4 }}
                    >
                      {b.emoji}
                    </Text>
                    {!b.unlocked && (
                      <View style={styles.badgeLockBadge}>
                        <Ionicons
                          name="lock-closed"
                          size={10}
                          color="#FFFFFF"
                        />
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.badgeTitle,
                      !b.unlocked && { color: C.inkSoft },
                    ]}
                    numberOfLines={1}
                  >
                    {b.title}
                  </Text>
                  <Text style={styles.badgeXpText}>{b.xp}</Text>
                </View>
              </Tap>
            ))}
          </View>
        </Animated.View>

        {/* ─── 3. 4 Core Learning Stats ─── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEyebrow}>O‘QUV NATIJALARI</Text>
          <Text style={styles.sectionTitle}>Umumiy Statistika</Text>
        </View>

        <View style={styles.statsGrid}>
          {/* Daqiqa */}
          <View style={[styles.statCard, { backgroundColor: "#F0ECFE" }]}>
            <View style={[styles.statIconBox, { backgroundColor: C.violet }]}>
              <Ionicons name="time" size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.statValue, { color: C.ink }]}>
              {profile.totalMinutesRead || 120}
            </Text>
            <Text style={styles.statLabel}>Daqiqa mutolaa</Text>
            <Text style={[styles.statSub, { color: C.violet }]}>
              Umumiy vaqt
            </Text>
          </View>

          {/* So'zlar */}
          <View style={[styles.statCard, { backgroundColor: "#E7F9F3" }]}>
            <View style={[styles.statIconBox, { backgroundColor: C.mint }]}>
              <Ionicons name="sparkles" size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.statValue, { color: C.ink }]}>
              {masteredCount}
            </Text>
            <Text style={styles.statLabel}>Yodlangan so‘zlar</Text>
            <Text style={[styles.statSub, { color: "#0FA780" }]}>
              Faol lug‘at
            </Text>
          </View>

          {/* Asarlar */}
          <View style={[styles.statCard, { backgroundColor: "#E9EEFF" }]}>
            <View style={[styles.statIconBox, { backgroundColor: C.blue }]}>
              <Ionicons name="book" size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.statValue, { color: C.ink }]}>
              {finishedReadingsCount}
            </Text>
            <Text style={styles.statLabel}>O‘qilgan asarlar</Text>
            <Text style={[styles.statSub, { color: C.blue }]}>Tugallangan</Text>
          </View>

          {/* Qaydlar */}
          <View style={[styles.statCard, { backgroundColor: "#FFEBF3" }]}>
            <View style={[styles.statIconBox, { backgroundColor: C.pink }]}>
              <Ionicons name="create" size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.statValue, { color: C.ink }]}>
              {notes.length}
            </Text>
            <Text style={styles.statLabel}>Yozilgan qaydlar</Text>
            <Text style={[styles.statSub, { color: "#E0487B" }]}>Insholar</Text>
          </View>
        </View>

        {/* ─── 4. AI Imtihonlar & Sinovlar Natijalari (Kelgusi Imtihon Bloki) ─── */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(450)}
          style={styles.sectionWrap}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEyebrow}>IMTIHONLAR & SINOVLAR</Text>
            <Text style={styles.sectionTitle}>AI Sinov Natijalari</Text>
          </View>

          <View style={styles.examCard}>
            <LinearGradient
              colors={["#F9F7FF", "#FFFFFF"]}
              style={styles.examCardGrad}
            >
              <View style={styles.rowBetween}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <View style={styles.examIconCircle}>
                    <Ionicons name="ribbon" size={22} color={C.violet} />
                  </View>
                  <View>
                    <Text style={styles.examTitle}>B1 Diagnostika Sinovi</Text>
                    <Text style={styles.examDate}>
                      Oxirgi natija • 3 kun oldin
                    </Text>
                  </View>
                </View>

                <View style={styles.examScoreBadge}>
                  <Text style={styles.examScoreNum}>85%</Text>
                  <Text style={styles.examScorePass}>A’LO</Text>
                </View>
              </View>

              <View style={styles.examBarsRow}>
                <View style={styles.examBarCol}>
                  <Text style={styles.examBarLabel}>Mutolaa</Text>
                  <View style={styles.examTrack}>
                    <View
                      style={[
                        styles.examFill,
                        { width: "90%", backgroundColor: C.blue },
                      ]}
                    />
                  </View>
                  <Text style={styles.examBarVal}>90%</Text>
                </View>
                <View style={styles.examBarCol}>
                  <Text style={styles.examBarLabel}>Lug‘at</Text>
                  <View style={styles.examTrack}>
                    <View
                      style={[
                        styles.examFill,
                        { width: "80%", backgroundColor: C.mint },
                      ]}
                    />
                  </View>
                  <Text style={styles.examBarVal}>80%</Text>
                </View>
                <View style={styles.examBarCol}>
                  <Text style={styles.examBarLabel}>Yozish</Text>
                  <View style={styles.examTrack}>
                    <View
                      style={[
                        styles.examFill,
                        { width: "85%", backgroundColor: C.pink },
                      ]}
                    />
                  </View>
                  <Text style={styles.examBarVal}>85%</Text>
                </View>
              </View>

              <View style={styles.examInfoPill}>
                <Ionicons name="sparkles" size={14} color={C.yellow} />
                <Text style={styles.examInfoText}>
                  Tez kunda: AI tomonidan avtomatik tuziluvchi to‘liq imtihon
                  tizimi!
                </Text>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* ─── 5. Gemini AI Assistant Card ─── */}
        <Animated.View
          entering={FadeInDown.delay(360).duration(450)}
          style={styles.aiCardContainer}
        >
          <Tap onPress={() => setIsApiKeyModalOpen(true)}>
            <View style={styles.aiCard}>
              <LinearGradient
                colors={["#FFF5EB", "#FFF9F4"]}
                style={styles.aiGradientBg}
              >
                <View style={styles.aiIconCircle}>
                  <Ionicons name="bulb" size={24} color="#FF9F43" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.aiTitleRow}>
                    <Text style={styles.aiTitle}>Google Gemini AI</Text>
                    <View
                      style={[
                        styles.aiStatusBadge,
                        apiKey ? styles.aiActiveBadge : styles.aiInactiveBadge,
                      ]}
                    >
                      <View
                        style={[
                          styles.aiStatusDot,
                          { backgroundColor: apiKey ? "#2ED573" : "#FFA502" },
                        ]}
                      />
                      <Text
                        style={[
                          styles.aiStatusText,
                          { color: apiKey ? "#1EA756" : "#C27800" },
                        ]}
                      >
                        {apiKey ? "Faol ulangan" : "Kalit kiritish"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.aiDesc}>
                    O‘qish va so‘zlarni chuqur tahlil qilish uchun Gemini 1.5
                    Flash
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={C.inkSoft}
                  style={{ marginLeft: 6 }}
                />
              </LinearGradient>
            </View>
          </Tap>
        </Animated.View>

        {/* ─── 6. Reading Preferences ─── */}
        <Animated.View
          entering={FadeInDown.delay(420).duration(450)}
          style={styles.settingsSection}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEyebrow}>QULAYLIKLAR</Text>
            <Text style={styles.sectionTitle}>Mutolaa Sozlamalari</Text>
          </View>

          <View style={styles.settingsBlock}>
            {/* Setting 1: Auto-add to vocab */}
            <View style={styles.settingItemRow}>
              <View
                style={[styles.settingIconPill, { backgroundColor: "#EDE9FE" }]}
              >
                <Ionicons name="add-circle" size={20} color={C.violet} />
              </View>
              <View style={styles.settingItemInfo}>
                <Text style={styles.settingItemTitle}>
                  So‘zni bosganda lug‘atga olish
                </Text>
                <Text style={styles.settingItemSub}>
                  O‘qish paytida yangi so‘zlar avtomatik saqlanadi
                </Text>
              </View>
              <AnimatedSwitch
                value={!!settings.autoAddOnTap}
                onValueChange={(val) => updateSettings({ autoAddOnTap: val })}
              />
            </View>

            <View style={styles.settingsDivider} />

            {/* Setting 2: TTS pronunciation */}
            <View style={styles.settingItemRow}>
              <View
                style={[styles.settingIconPill, { backgroundColor: "#E7F9F3" }]}
              >
                <Ionicons name="volume-high" size={20} color={C.mint} />
              </View>
              <View style={styles.settingItemInfo}>
                <Text style={styles.settingItemTitle}>
                  Avtomatik ovozli talaffuz (TTS)
                </Text>
                <Text style={styles.settingItemSub}>
                  So‘z tanlanganda tabiiy ovoz bilan o‘qib beriladi
                </Text>
              </View>
              <AnimatedSwitch
                value={!!settings.ttsAutoPlay}
                onValueChange={(val) => updateSettings({ ttsAutoPlay: val })}
              />
            </View>
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ─── MODAL 1: Avatar Tanlash ─── */}
      <Modal visible={isAvatarModalOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <Animated.View
            entering={FadeInDown.duration(250)}
            style={styles.modalCard}
          >
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>Avatarni Tanlang</Text>
                <Text style={styles.modalSubTitle}>
                  Profil qahramoningizni tanlang
                </Text>
              </View>
              <Tap onPress={() => setIsAvatarModalOpen(false)}>
                <View style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={20} color={C.ink} />
                </View>
              </Tap>
            </View>

            <View style={styles.avatarGrid}>
              {AVATAR_OPTIONS.map((av) => (
                <Tap key={av} onPress={() => handleSelectAvatar(av)}>
                  <View
                    style={[
                      styles.avatarPickCircle,
                      currentAvatar === av && styles.avatarPickCircleActive,
                    ]}
                  >
                    <Text style={{ fontSize: 34 }}>{av}</Text>
                  </View>
                </Tap>
              ))}
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* ─── MODAL 2: CEFR Darajasini Belgilash ─── */}
      <Modal visible={isLevelModalOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <Animated.View
            entering={FadeInDown.duration(250)}
            style={styles.modalCard}
          >
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>Bilim Darajangiz</Text>
                <Text style={styles.modalSubTitle}>
                  CEFR xalqaro darajasini belgilang
                </Text>
              </View>
              <Tap onPress={() => setIsLevelModalOpen(false)}>
                <View style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={20} color={C.ink} />
                </View>
              </Tap>
            </View>

            <View style={{ gap: 10 }}>
              {CEFR_LEVELS.map((lvl) => {
                const isSelected = currentLevel === lvl.level;
                return (
                  <Tap
                    key={lvl.level}
                    onPress={() => handleSelectLevel(lvl.level, lvl.name)}
                  >
                    <View
                      style={[
                        styles.levelCardOption,
                        isSelected && styles.levelCardOptionActive,
                      ]}
                    >
                      <View
                        style={[
                          styles.levelOptionBadge,
                          isSelected && { backgroundColor: C.violet },
                        ]}
                      >
                        <Text
                          style={[
                            styles.levelOptionBadgeText,
                            isSelected && { color: "#FFFFFF" },
                          ]}
                        >
                          {lvl.level}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.levelOptionName}>{lvl.name}</Text>
                        <Text style={styles.levelOptionDesc}>{lvl.desc}</Text>
                      </View>
                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={22}
                          color={C.violet}
                        />
                      )}
                    </View>
                  </Tap>
                );
              })}
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* ─── MODAL 3: Nishon Tafsilotlari ─── */}
      <Modal visible={!!selectedBadge} transparent animationType="fade">
        {selectedBadge && (
          <View style={styles.modalBackdrop}>
            <Animated.View
              entering={FadeInDown.duration(250)}
              style={styles.modalCard}
            >
              <View style={styles.modalHeaderRow}>
                <View />
                <Tap onPress={() => setSelectedBadge(null)}>
                  <View style={styles.modalCloseBtn}>
                    <Ionicons name="close" size={20} color={C.ink} />
                  </View>
                </Tap>
              </View>

              <View style={{ alignItems: "center", marginVertical: 12 }}>
                <View
                  style={[
                    styles.badgeModalIconCircle,
                    { backgroundColor: selectedBadge.color + "25" },
                  ]}
                >
                  <Text style={{ fontSize: 50 }}>{selectedBadge.emoji}</Text>
                </View>
                <Text style={styles.badgeModalTitle}>
                  {selectedBadge.title}
                </Text>
                <Text style={styles.badgeModalDesc}>{selectedBadge.desc}</Text>

                <View style={styles.badgeModalStatusBox}>
                  <Text style={styles.badgeModalStatusText}>
                    {selectedBadge.unlocked ? "🎉 Erishildi!" : "🔒 Qulflangan"}
                  </Text>
                  <Text style={styles.badgeModalProgress}>
                    {selectedBadge.progress}
                  </Text>
                </View>
              </View>

              <Tap onPress={() => setSelectedBadge(null)}>
                <LinearGradient
                  colors={[C.violet, C.blue]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalSaveBtnGradient}
                >
                  <Text style={styles.modalSaveText}>Yopish</Text>
                </LinearGradient>
              </Tap>
            </Animated.View>
          </View>
        )}
      </Modal>

      {/* ─── MODAL 4: Profil Tahriri ─── */}
      <Modal visible={isEditingName} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <Animated.View
            entering={FadeInDown.duration(250)}
            style={styles.modalCard}
          >
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>Profilni Tahrirlash</Text>
                <Text style={styles.modalSubTitle}>
                  Shaxsiy ma’lumotlarni yangilang
                </Text>
              </View>
              <Tap onPress={() => setIsEditingName(false)}>
                <View style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={20} color={C.ink} />
                </View>
              </Tap>
            </View>

            <Text style={styles.inputLabel}>ISMINGIZ</Text>
            <TextInput
              style={styles.modalInput}
              value={userName}
              onChangeText={setUserName}
              placeholder="Ism..."
              placeholderTextColor={C.inkSoft}
            />

            <Text style={styles.inputLabel}>
              KUNLIK MUTOLAA MAQSADI (DAQIQA)
            </Text>
            <TextInput
              style={styles.modalInput}
              value={dailyGoal}
              onChangeText={setDailyGoal}
              placeholder="15"
              keyboardType="number-pad"
              placeholderTextColor={C.inkSoft}
            />

            <Tap onPress={handleSaveProfile} style={{ marginTop: 10 }}>
              <LinearGradient
                colors={[C.violet, C.blue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalSaveBtnGradient}
              >
                <Text style={styles.modalSaveText}>Saqlash</Text>
              </LinearGradient>
            </Tap>
          </Animated.View>
        </View>
      </Modal>

      {/* ─── MODAL 5: Gemini API Kalit ─── */}
      <Modal visible={isApiKeyModalOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <Animated.View
            entering={FadeInDown.duration(250)}
            style={styles.modalCard}
          >
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>Google Gemini API</Text>
                <Text style={styles.modalSubTitle}>
                  AI xizmatlarini faollashtirish
                </Text>
              </View>
              <Tap onPress={() => setIsApiKeyModalOpen(false)}>
                <View style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={20} color={C.ink} />
                </View>
              </Tap>
            </View>

            <Text style={styles.modalExplanation}>
              Google AI Studio (aistudio.google.com) orqali olingan bepul API
              kalitingizni kiriting:
            </Text>

            <Text style={styles.inputLabel}>GEMINI API KALITI</Text>
            <TextInput
              style={styles.modalInput}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="AIzaSy..."
              placeholderTextColor={C.inkSoft}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Tap onPress={handleSaveApiKey} style={{ marginTop: 10 }}>
              <LinearGradient
                colors={["#FF9F43", "#FF5252"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalSaveBtnGradient}
              >
                <Text style={styles.modalSaveText}>Kalitni Saqlash</Text>
              </LinearGradient>
            </Tap>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 36 : 16,
    paddingBottom: 110,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // Header
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerSubtitle: {
    fontSize: 11,
    fontFamily: F.bodyBold,
    color: C.violet,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: F.display,
    color: C.ink,
    marginTop: 2,
  },
  editBtnPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  editBtnText: { fontSize: 12, fontFamily: F.bodyBold, color: C.violet },

  // Hero Banner Card
  heroCardContainer: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 22,
    shadowColor: C.violet,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
  heroGradient: { padding: 22, position: "relative", borderRadius: 24 },
  heroBgCircle1: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  heroBgCircle2: {
    position: "absolute",
    bottom: -40,
    left: -20,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  heroTopRow: { flexDirection: "row", alignItems: "center" },
  avatarWrapper: { position: "relative", marginRight: 14 },
  avatarInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  avatarBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.ink,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  heroMeta: { flex: 1 },
  heroName: {
    fontSize: 20,
    fontFamily: F.display,
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  levelTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 5,
  },
  levelTagText: { fontSize: 11.5, fontFamily: F.bodyBold, color: "#FFFFFF" },

  // Streak Flame Badge
  streakBadge: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#FF5252",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  streakGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
    borderRadius: 20,
  },
  streakText: { fontSize: 12, fontFamily: F.display, color: "#FFFFFF" },

  // Hero Goal Row
  heroGoalRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderRadius: 16,
    padding: 12,
    marginTop: 18,
    gap: 12,
  },
  goalIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  goalLabel: {
    fontSize: 9,
    fontFamily: F.bodyBold,
    color: "rgba(255, 255, 255, 0.8)",
    letterSpacing: 0.8,
  },
  goalValue: {
    fontSize: 13,
    fontFamily: F.bodySemi,
    color: "#FFFFFF",
    marginTop: 1,
  },
  changeGoalPill: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  changeGoalText: { fontSize: 11, fontFamily: F.bodyBold, color: C.violet },

  // Section Headers
  sectionWrap: { marginBottom: 22 },
  sectionHeader: { marginBottom: 12 },
  sectionEyebrow: {
    fontSize: 11,
    fontFamily: F.bodyBold,
    color: C.inkSoft,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: F.display,
    color: C.ink,
    marginTop: 2,
  },

  // 1. Activity Matrix Card
  activityCard: {
    backgroundColor: C.white,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayCol: { alignItems: "center", gap: 5 },
  dayDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dayDotActive: { backgroundColor: C.mint },
  dayDotInactive: { backgroundColor: "#F0ECFA" },
  dayDotToday: { borderWidth: 2, borderColor: C.violet },
  dayLabel: { fontSize: 12, fontFamily: F.bodySemi, color: C.inkSoft },
  dayMins: { fontSize: 9.5, fontFamily: F.bodyBold, color: C.inkSoft },
  activityStatsDivider: {
    height: 1,
    backgroundColor: C.borderSubtle,
    marginVertical: 14,
  },
  activitySummaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  activitySummaryCol: { alignItems: "center" },
  actSumVal: { fontSize: 14, fontFamily: F.display, color: C.ink },
  actSumLabel: {
    fontSize: 11,
    fontFamily: F.bodySemi,
    color: C.inkSoft,
    marginTop: 1,
  },
  actSumSep: { width: 1, height: 24, backgroundColor: C.borderSubtle },

  // 2. Badges System
  badgeCountChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FFF8E6",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeCountText: { fontSize: 12, fontFamily: F.bodyBold, color: "#C27800" },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  badgeCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  badgeCardLocked: { opacity: 0.65, backgroundColor: "#FAF9FE" },
  badgeIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    position: "relative",
  },
  badgeLockBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.inkSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeTitle: {
    fontSize: 11.5,
    fontFamily: F.bodyBold,
    color: C.ink,
    textAlign: "center",
  },
  badgeXpText: {
    fontSize: 10,
    fontFamily: F.bodySemi,
    color: C.violet,
    marginTop: 2,
  },

  // 3. Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 22,
  },
  statCard: {
    width: "48%",
    borderRadius: 20,
    padding: 16,
    position: "relative",
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: { fontSize: 28, fontFamily: F.display, letterSpacing: -0.5 },
  statLabel: {
    fontSize: 13,
    fontFamily: F.bodySemi,
    color: C.inkSoft,
    marginTop: 2,
  },
  statSub: {
    fontSize: 10,
    fontFamily: F.bodyBold,
    marginTop: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // 4. Exam Results Card
  examCard: {
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8E2FA",
    shadowColor: C.violet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  examCardGrad: { padding: 18 },
  examIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
  },
  examTitle: { fontSize: 16, fontFamily: F.display, color: C.ink },
  examDate: {
    fontSize: 11.5,
    fontFamily: F.body,
    color: C.inkSoft,
    marginTop: 1,
  },
  examScoreBadge: {
    alignItems: "center",
    backgroundColor: "#E7F9F3",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  examScoreNum: { fontSize: 17, fontFamily: F.display, color: "#0FA780" },
  examScorePass: { fontSize: 9, fontFamily: F.bodyBold, color: "#0FA780" },
  examBarsRow: { flexDirection: "row", gap: 14, marginVertical: 14 },
  examBarCol: { flex: 1 },
  examBarLabel: {
    fontSize: 11,
    fontFamily: F.bodySemi,
    color: C.inkSoft,
    marginBottom: 4,
  },
  examTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ECE9F8",
    overflow: "hidden",
  },
  examFill: { height: "100%", borderRadius: 3 },
  examBarVal: {
    fontSize: 11,
    fontFamily: F.bodyBold,
    color: C.ink,
    marginTop: 3,
  },
  examInfoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F5F2FF",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  examInfoText: {
    fontSize: 11.5,
    fontFamily: F.bodySemi,
    color: C.violet,
    flex: 1,
  },

  // 5. Gemini AI Card
  aiCardContainer: {
    marginBottom: 22,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#FF9F43",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  aiCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#FFE0B2",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  aiGradientBg: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  aiIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF2E2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFDCA8",
  },
  aiTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  aiTitle: { fontSize: 15, fontFamily: F.display, color: C.ink },
  aiStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  aiActiveBadge: { backgroundColor: "#E8FBF0" },
  aiInactiveBadge: { backgroundColor: "#FFF5E0" },
  aiStatusDot: { width: 6, height: 6, borderRadius: 3 },
  aiStatusText: { fontSize: 10, fontFamily: F.bodyBold },
  aiDesc: {
    fontSize: 11,
    fontFamily: F.body,
    color: C.inkSoft,
    lineHeight: 15,
  },

  // 6. Settings
  settingsSection: { marginBottom: 20 },
  settingsBlock: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
  },
  settingIconPill: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  settingItemInfo: { flex: 1 },
  settingItemTitle: { fontSize: 14, fontFamily: F.bodyBold, color: C.ink },
  settingItemSub: {
    fontSize: 11,
    fontFamily: F.body,
    color: C.inkSoft,
    marginTop: 2,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: C.borderSubtle,
    marginVertical: 12,
  },

  // Switch
  switchTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
  },
  switchTrackActive: { backgroundColor: C.violet },
  switchTrackInactive: { backgroundColor: "#E2DCF8" },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 2,
  },

  // Modals
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(29, 17, 71, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  modalTitle: { fontSize: 20, fontFamily: F.display, color: C.ink },
  modalSubTitle: {
    fontSize: 12,
    fontFamily: F.body,
    color: C.inkSoft,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F2FF",
    alignItems: "center",
    justifyContent: "center",
  },

  // Avatar Grid Modal
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    marginVertical: 8,
  },
  avatarPickCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#F5F2FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  avatarPickCircleActive: { borderColor: C.violet, backgroundColor: "#EDE9FE" },

  // Level Option Modal
  levelCardOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    gap: 12,
  },
  levelCardOptionActive: { borderColor: C.violet, backgroundColor: "#F9F8FD" },
  levelOptionBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
  },
  levelOptionBadgeText: {
    fontSize: 13,
    fontFamily: F.display,
    color: C.violet,
  },
  levelOptionName: { fontSize: 14, fontFamily: F.bodyBold, color: C.ink },
  levelOptionDesc: {
    fontSize: 11,
    fontFamily: F.body,
    color: C.inkSoft,
    marginTop: 1,
  },

  // Badge Modal
  badgeModalIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  badgeModalTitle: { fontSize: 22, fontFamily: F.display, color: C.ink },
  badgeModalDesc: {
    fontSize: 13,
    fontFamily: F.body,
    color: C.inkSoft,
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 16,
  },
  badgeModalStatusBox: {
    backgroundColor: "#F5F2FF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginTop: 14,
    alignItems: "center",
  },
  badgeModalStatusText: {
    fontSize: 14,
    fontFamily: F.display,
    color: C.violet,
  },
  badgeModalProgress: {
    fontSize: 12,
    fontFamily: F.bodySemi,
    color: C.inkSoft,
    marginTop: 2,
  },

  // Form Inputs
  inputLabel: {
    fontSize: 10,
    fontFamily: F.bodyBold,
    color: C.inkSoft,
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 6,
  },
  modalInput: {
    backgroundColor: "#F7F5FE",
    borderWidth: 1.5,
    borderColor: "#E8E4F8",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: F.bodySemi,
    color: C.ink,
    marginBottom: 12,
  },
  modalSaveBtnGradient: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSaveText: { fontSize: 14, fontFamily: F.bodyBold, color: "#FFFFFF" },
  modalExplanation: {
    fontSize: 12,
    fontFamily: F.body,
    color: C.inkSoft,
    marginBottom: 14,
    lineHeight: 18,
  },
});
