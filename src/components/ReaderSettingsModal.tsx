/**
 * ReadScribe Reader Settings Modal
 * Clean minimalist typography & theme adjustment modal.
 */

import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Switch } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize } from '../theme';
import { useApp } from '../context/AppContext';
import { ReadingTheme, ReadingFontFamily, READING_THEME_LABELS, READING_FONT_LABELS } from '../types';
import { Icon } from './Icon';

interface ReaderSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ReaderSettingsModal: React.FC<ReaderSettingsModalProps> = ({ visible, onClose }) => {
  const { settings, updateSettings } = useApp();

  const themes: ReadingTheme[] = ['light', 'sepia', 'dark', 'night'];
  const fonts: ReadingFontFamily[] = ['serif', 'sans', 'mono'];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Matn Ko‘rinishi</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icon name="close" size={18} color={Colors.ink} />
            </TouchableOpacity>
          </View>

          {/* Font Size Stepper */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shrift kattaligi ({settings.fontSizeSp}pt)</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                style={[styles.stepperBtn, settings.fontSizeSp <= 14 && styles.stepperDisabled]}
                onPress={() => updateSettings({ fontSizeSp: Math.max(14, settings.fontSizeSp - 2) })}
                disabled={settings.fontSizeSp <= 14}
              >
                <Text style={styles.stepperBtnText}>A-</Text>
              </TouchableOpacity>

              <View style={styles.stepperTrack}>
                <View
                  style={[
                    styles.stepperFill,
                    { width: `${((settings.fontSizeSp - 14) / (26 - 14)) * 100}%` },
                  ]}
                />
              </View>

              <TouchableOpacity
                style={[styles.stepperBtn, settings.fontSizeSp >= 26 && styles.stepperDisabled]}
                onPress={() => updateSettings({ fontSizeSp: Math.min(26, settings.fontSizeSp + 2) })}
                disabled={settings.fontSizeSp >= 26}
              >
                <Text style={styles.stepperBtnText}>A+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Reading Themes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mavzu (Ranglar)</Text>
            <View style={styles.themeGrid}>
              {themes.map((t) => {
                const isSelected = settings.readingTheme === t;
                const themeColors = Colors.reader[t];
                return (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.themeCard,
                      { backgroundColor: themeColors.bg, borderColor: isSelected ? Colors.ink : themeColors.border },
                      isSelected && styles.themeCardActive,
                    ]}
                    onPress={() => updateSettings({ readingTheme: t })}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.themeSampleText, { color: themeColors.text }]}>Aa</Text>
                    <Text style={[styles.themeLabel, { color: themeColors.text }]}>
                      {READING_THEME_LABELS[t]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Font Family */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shrift turi</Text>
            <View style={styles.fontRow}>
              {fonts.map((f) => {
                const isSelected = settings.fontFamily === f;
                return (
                  <TouchableOpacity
                    key={f}
                    style={[styles.fontBtn, isSelected && styles.fontBtnActive]}
                    onPress={() => updateSettings({ fontFamily: f })}
                  >
                    <Text style={[styles.fontBtnText, isSelected && styles.fontBtnTextActive]}>
                      {READING_FONT_LABELS[f]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Auto Add on Tap Switch */}
          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.switchTitle}>So‘zni bosganda avtomatik saqlash</Text>
              <Text style={styles.switchDesc}>
                Yangi so‘zlar to‘g‘ridan-to‘g‘ri lug‘atga kiritiladi
              </Text>
            </View>
            <Switch
              value={settings.autoAddOnTap}
              onValueChange={(val) => updateSettings({ autoAddOnTap: val })}
              trackColor={{ false: Colors.border, true: Colors.ink }}
              thumbColor={Colors.white}
            />
          </View>

          <TouchableOpacity style={styles.doneButton} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.doneButtonText}>Tayyor</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  closeBtn: {
    padding: 4,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.inkTertiary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  stepperBtn: {
    width: 44,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.canvasMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperDisabled: {
    opacity: 0.3,
  },
  stepperBtnText: {
    fontSize: FontSize.base,
    fontWeight: '700',
    color: Colors.ink,
  },
  stepperTrack: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.canvasMuted,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  stepperFill: {
    height: '100%',
    backgroundColor: Colors.ink,
  },
  themeGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  themeCard: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  themeCardActive: {
    borderWidth: 2,
  },
  themeSampleText: {
    fontSize: FontSize.base,
    fontWeight: '700',
    marginBottom: 2,
  },
  themeLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
  fontRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  fontBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: Colors.canvasMuted,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  fontBtnActive: {
    backgroundColor: Colors.ink,
  },
  fontBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.inkSecondary,
  },
  fontBtnTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    marginBottom: Spacing.lg,
  },
  switchLabelContainer: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  switchTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.ink,
  },
  switchDesc: {
    fontSize: FontSize.xs,
    color: Colors.inkTertiary,
    marginTop: 2,
  },
  doneButton: {
    backgroundColor: Colors.ink,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
});
