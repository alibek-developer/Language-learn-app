/**
 * ReadScribe Reader Screen
 * Immersive zero-distraction reading canvas:
 * - Clean top status & quick typography settings
 * - Optimal line spacing (1.8x) & font sizing for RedMi 15
 * - Interactive word lookup on tap
 * - AI sentence analysis & TTS pronunciation.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize } from '../theme';
import { useApp } from '../context/AppContext';
import { ReaderSettingsModal } from '../components/ReaderSettingsModal';
import { Icon } from '../components/Icon';

interface ReaderScreenProps {
  onBack: () => void;
}

export const ReaderScreen: React.FC<ReaderScreenProps> = ({ onBack }) => {
  const {
    selectedReading,
    settings,
    updateReadingProgress,
    markReadingFinished,
    addReadMinutes,
    openWordLookup,
    openSentenceAnalysis,
    speakText,
  } = useApp();

  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [scrollProgress, setScrollProgress] = useState(selectedReading?.scrollProgress || 0);

  // Active reading timer
  useEffect(() => {
    const timer = setInterval(() => {
      addReadMinutes(1);
    }, 60000);
    return () => clearInterval(timer);
  }, [addReadMinutes]);

  if (!selectedReading) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Matn topilmadi</Text>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>Ortga</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const themeColors = Colors.reader[settings.readingTheme];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const maxScroll = contentSize.height - layoutMeasurement.height;
    if (maxScroll > 0) {
      const current = Math.max(0, Math.min(1, contentOffset.y / maxScroll));
      setScrollProgress(current);
      updateReadingProgress(selectedReading.id, current, 0);
    }
  };

  const paragraphs = selectedReading.content.split('\n\n').filter((p) => p.trim().length > 0);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.bg }]}>
      {/* Top Clean Bar */}
      <View style={[styles.topBar, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.iconButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Icon name="arrow-left" size={20} color={themeColors.text} />
        </TouchableOpacity>

        <View style={styles.topTitleBox}>
          <Text style={[styles.topTitleText, { color: themeColors.text }]} numberOfLines={1}>
            {selectedReading.title}
          </Text>
          <Text style={[styles.topPercentText, { color: themeColors.text }]}>
            {Math.round(scrollProgress * 100)}% o‘qildi
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsSettingsVisible(true)}
          style={styles.iconButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Icon name="settings" size={19} color={themeColors.text} />
        </TouchableOpacity>
      </View>

      {/* Thin Reading Progress Indicator */}
      <View style={[styles.progressBarTrack, { backgroundColor: themeColors.card }]}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${Math.round(scrollProgress * 100)}%`,
              backgroundColor: Colors.accent,
            },
          ]}
        />
      </View>

      {/* Reading Canvas */}
      <ScrollView
        ref={scrollRef}
        style={styles.canvas}
        contentContainerStyle={styles.canvasContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Article Header */}
        <View style={styles.articleHeader}>
          <Text
            style={[
              styles.articleTitle,
              {
                color: themeColors.text,
                fontSize: settings.fontSizeSp + 6,
                fontFamily: settings.fontFamily === 'mono' ? 'monospace' : undefined,
              },
            ]}
          >
            {selectedReading.title}
          </Text>
          <Text style={[styles.articleAuthor, { color: themeColors.text }]}>
            {selectedReading.author} • {selectedReading.level}
          </Text>
        </View>

        {/* Paragraphs with Interactive Words */}
        {paragraphs.map((para, pIndex) => {
          const sentences = para.split(/(?<=[.?!])\s+/);

          return (
            <View key={`para-${pIndex}`} style={styles.paragraphBlock}>
              <View style={styles.paragraphTextContainer}>
                {sentences.map((sentence, sIndex) => {
                  const words = sentence.split(/(\s+)/);

                  return (
                    <Text
                      key={`s-${sIndex}`}
                      style={[
                        styles.sentence,
                        {
                          color: themeColors.text,
                          fontSize: settings.fontSizeSp,
                          lineHeight: Math.round(
                            settings.fontSizeSp * settings.lineSpacingMultiplier
                          ),
                          fontFamily: settings.fontFamily === 'mono' ? 'monospace' : undefined,
                        },
                      ]}
                    >
                      {words.map((word, wIndex) => {
                        const isWhitespace = /^\s+$/.test(word);
                        if (isWhitespace) {
                          return <Text key={`w-${wIndex}`}>{word}</Text>;
                        }

                        return (
                          <Text
                            key={`w-${wIndex}`}
                            style={styles.wordInteractive}
                            onPress={() =>
                              openWordLookup(word, sentence.trim(), selectedReading.title)
                            }
                          >
                            {word}
                          </Text>
                        );
                      })}
                    </Text>
                  );
                })}
              </View>

              {/* Minimal Paragraph Actions: AI Analysis & Audio */}
              <View style={styles.paraToolsRow}>
                <TouchableOpacity
                  style={[styles.toolChip, { backgroundColor: themeColors.card }]}
                  onPress={() => openSentenceAnalysis(para.trim())}
                  activeOpacity={0.7}
                >
                  <Icon name="sparkles" size={13} color={Colors.accent} />
                  <Text style={[styles.toolChipText, { color: themeColors.text }]}>
                    AI Tahlil
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.toolChip, { backgroundColor: themeColors.card }]}
                  onPress={() => speakText(para.trim())}
                  activeOpacity={0.7}
                >
                  <Icon name="volume" size={13} color={themeColors.text} />
                  <Text style={[styles.toolChipText, { color: themeColors.text }]}>
                    Tinglash
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Completion Card */}
        <View style={[styles.finishCard, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.finishTitle, { color: themeColors.text }]}>
            {selectedReading.isFinished ? 'Asar o‘qib tugatilgan' : 'Asar yakuniga yetdingiz'}
          </Text>
          <TouchableOpacity
            style={styles.finishActionButton}
            onPress={() => markReadingFinished(selectedReading.id, !selectedReading.isFinished)}
            activeOpacity={0.8}
          >
            <Icon
              name={selectedReading.isFinished ? 'repeat' : 'check'}
              size={16}
              color={Colors.white}
            />
            <Text style={styles.finishActionText}>
              {selectedReading.isFinished ? 'Qaytadan o‘qish' : 'Tugatildi deb belgilash'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Reader Settings Modal */}
      <ReaderSettingsModal
        visible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingTop: Spacing.topSafePadding,
    paddingHorizontal: Spacing.screenPaddingHorizontal,
    paddingBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitleBox: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  topTitleText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  topPercentText: {
    fontSize: 10,
    opacity: 0.6,
    marginTop: 2,
  },
  progressBarTrack: {
    height: 2,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
  },
  canvas: {
    flex: 1,
  },
  canvasContent: {
    paddingHorizontal: Spacing.screenPaddingHorizontal,
    paddingTop: Spacing.xl,
    paddingBottom: 60,
  },
  articleHeader: {
    marginBottom: Spacing['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    paddingBottom: Spacing.lg,
  },
  articleTitle: {
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: Spacing.xs,
  },
  articleAuthor: {
    fontSize: FontSize.xs,
    opacity: 0.6,
  },
  paragraphBlock: {
    marginBottom: Spacing['2xl'],
  },
  paragraphTextContainer: {
    marginBottom: Spacing.xs,
  },
  sentence: {
    letterSpacing: 0.1,
  },
  wordInteractive: {
    borderRadius: 3,
  },
  paraToolsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  toolChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
    gap: 4,
  },
  toolChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  finishCard: {
    marginTop: Spacing['2xl'],
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    gap: Spacing.md,
  },
  finishTitle: {
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  finishActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.ink,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  finishActionText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: FontSize.base,
    color: Colors.inkSecondary,
    marginBottom: Spacing.md,
  },
  backBtn: {
    backgroundColor: Colors.ink,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  backBtnText: {
    color: Colors.white,
    fontWeight: '700',
  },
});
