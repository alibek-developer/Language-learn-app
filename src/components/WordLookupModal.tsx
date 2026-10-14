/**
 * ReadScribe Word Lookup Sheet
 * Minimalist bottom sheet for instant word definitions & translations.
 */

import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize } from '../theme';
import { useApp } from '../context/AppContext';
import { Icon } from './Icon';

export const WordLookupModal: React.FC = () => {
  const { lookupState, closeWordLookup, saveLookupWord, speakText } = useApp();

  if (!lookupState) return null;

  return (
    <Modal
      visible={!!lookupState}
      transparent
      animationType="slide"
      onRequestClose={closeWordLookup}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeWordLookup}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.sheetContainer}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Subtle Grab Handle */}
          <View style={styles.handle} />

          {/* Word Header */}
          <View style={styles.headerRow}>
            <View style={styles.wordInfo}>
              <View style={styles.wordTitleRow}>
                <Text style={styles.wordText}>{lookupState.word}</Text>
                {lookupState.partOfSpeech ? (
                  <Text style={styles.posBadge}>{lookupState.partOfSpeech.toUpperCase()}</Text>
                ) : null}
              </View>
              {lookupState.phonetic ? (
                <Text style={styles.phoneticText}>{lookupState.phonetic}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={() => speakText(lookupState.word)}
              style={styles.audioButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="volume" size={19} color={Colors.ink} />
            </TouchableOpacity>
          </View>

          {/* Translation */}
          <View style={styles.translationBox}>
            <Text style={styles.boxLabel}>O‘ZBEKCHA TARJIMA</Text>
            <Text style={styles.translationText}>{lookupState.translation}</Text>
          </View>

          {/* Definition */}
          {lookupState.definition ? (
            <View style={styles.infoBox}>
              <Text style={styles.boxLabel}>ENGLISH DEFINITION</Text>
              <Text style={styles.definitionText}>{lookupState.definition}</Text>
            </View>
          ) : null}

          {/* Context Sentence */}
          {lookupState.contextSentence ? (
            <View style={styles.infoBox}>
              <Text style={styles.boxLabel}>MATNDAGI QO‘LLANISHI</Text>
              <Text style={styles.contextText}>“{lookupState.contextSentence}”</Text>
            </View>
          ) : null}

          {/* Action Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.saveBtn, lookupState.isSaved && styles.savedBtn]}
              onPress={saveLookupWord}
              disabled={lookupState.isSaved}
              activeOpacity={0.8}
            >
              <Icon
                name={lookupState.isSaved ? 'check' : 'plus'}
                size={16}
                color={lookupState.isSaved ? Colors.success : Colors.white}
              />
              <Text style={[styles.saveBtnText, lookupState.isSaved && styles.savedBtnText]}>
                {lookupState.isSaved ? 'Lug‘atda saqlangan' : 'Lug‘atga qo‘shish'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={closeWordLookup}
              activeOpacity={0.7}
            >
              <Text style={styles.closeBtnText}>Yopish</Text>
            </TouchableOpacity>
          </View>
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
  },
  handle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  wordInfo: {
    flex: 1,
  },
  wordTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  wordText: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.4,
  },
  posBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.inkTertiary,
    letterSpacing: 0.5,
  },
  phoneticText: {
    fontSize: FontSize.xs,
    color: Colors.inkSecondary,
    marginTop: 2,
  },
  audioButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.canvasMuted,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.accent,
  },
  infoBox: {
    backgroundColor: Colors.canvasMuted,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  definitionText: {
    fontSize: FontSize.xs,
    color: Colors.ink,
    lineHeight: 18,
  },
  contextText: {
    fontSize: FontSize.xs,
    color: Colors.inkSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.ink,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    gap: 6,
  },
  savedBtn: {
    backgroundColor: Colors.successSoft,
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  savedBtnText: {
    color: Colors.success,
  },
  closeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.canvasMuted,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
  },
  closeBtnText: {
    color: Colors.inkSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
