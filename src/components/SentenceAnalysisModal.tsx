/**
 * ReadScribe Sentence Analysis Sheet
 * Minimalist grammatical & AI translation analysis bottom sheet.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize } from '../theme';
import { useApp } from '../context/AppContext';
import { Icon } from './Icon';

export const SentenceAnalysisModal: React.FC = () => {
  const { analysisState, closeSentenceAnalysis, speakText } = useApp();

  if (!analysisState) return null;

  return (
    <Modal
      visible={!!analysisState}
      transparent
      animationType="slide"
      onRequestClose={closeSentenceAnalysis}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={closeSentenceAnalysis}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.sheetContainer}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />

          {/* Header Row */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.sheetTitle}>Gap Tahlili</Text>
              <Text style={styles.sheetSubtitle}>
                {analysisState.isFromAi ? 'Gemini 1.5 Flash' : 'Smart Offline AI'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => speakText(analysisState.originalText)}
              style={styles.audioButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="volume" size={18} color={Colors.ink} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Original Sentence */}
            <View style={styles.quoteBox}>
              <Text style={styles.quoteText}>“{analysisState.originalText}”</Text>
            </View>

            {analysisState.isLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={Colors.ink} />
                <Text style={styles.loadingText}>Tahlil qilinmoqda...</Text>
              </View>
            ) : (
              <>
                {/* Uzbek Translation */}
                <View style={styles.translationBox}>
                  <Text style={styles.boxLabel}>O‘ZBEKCHA TARJIMA</Text>
                  <Text style={styles.translationText}>{analysisState.translation}</Text>
                </View>

                {/* Grammar / Explanation */}
                <View style={styles.explanationBox}>
                  <Text style={styles.boxLabel}>GRAMMATIK TAHLIL & QOIDALAR</Text>
                  <Text style={styles.explanationText}>{analysisState.explanation}</Text>
                </View>
              </>
            )}
          </ScrollView>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={closeSentenceAnalysis}
            activeOpacity={0.8}
          >
            <Text style={styles.closeBtnText}>Tushunarli</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.screenPaddingHorizontal,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.bottomSafePadding + 12,
    maxHeight: '82%',
  },
  handle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  sheetSubtitle: {
    fontSize: 10,
    color: Colors.inkTertiary,
    marginTop: 1,
  },
  audioButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.canvasMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    marginBottom: Spacing.md,
  },
  quoteBox: {
    backgroundColor: Colors.canvasMuted,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  quoteText: {
    fontSize: FontSize.sm,
    color: Colors.ink,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  translationBox: {
    backgroundColor: Colors.accentSoft,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  boxLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.inkTertiary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  translationText: {
    fontSize: FontSize.base,
    fontWeight: '700',
    color: Colors.accent,
    lineHeight: 22,
  },
  explanationBox: {
    backgroundColor: Colors.canvasMuted,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  explanationText: {
    fontSize: FontSize.xs,
    color: Colors.inkSecondary,
    lineHeight: 20,
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: FontSize.xs,
    color: Colors.inkTertiary,
  },
  closeBtn: {
    backgroundColor: Colors.ink,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
});
