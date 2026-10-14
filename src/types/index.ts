/**
 * ReadScribe TypeScript Type Definitions
 */

// ========================
// Data Models
// ========================

export interface ReadingItem {
  id: string;
  title: string;
  author: string;
  category: string;
  level: string;
  content: string;
  estimatedReadMinutes: number;
  lastReadTimestamp: number;
  scrollProgress: number; // 0.0 to 1.0
  lastReadParagraph: number;
  isFinished: boolean;
  isCustom: boolean;
  createdAt: number;
}

export interface WritingNote {
  id: string;
  title: string;
  content: string;
  category: string;
  wordCount: number;
  isPinned: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface VocabularyWord {
  id: string;
  word: string;
  phonetic: string;
  translation: string;
  definition: string;
  contextSentence: string;
  sourceTitle: string;
  partOfSpeech: string;
  isMastered: boolean;
  isFavorite: boolean;
  reviewCount: number;
  createdAt: number;
}

export interface ReadingHistoryEntry {
  id: string;
  readingId: string;
  readingTitle: string;
  timestamp: number;
  progressPercentage: number;
  timeSpentSeconds: number;
}

// ========================
// Reader Settings
// ========================

export type ReadingTheme = 'light' | 'sepia' | 'dark' | 'night';
export type ReadingFontFamily = 'serif' | 'sans' | 'mono';

export interface ReaderSettings {
  fontSizeSp: number;
  readingTheme: ReadingTheme;
  fontFamily: ReadingFontFamily;
  lineSpacingMultiplier: number;
  autoAddOnTap: boolean;
  ttsAutoPlay: boolean;
}

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  fontSizeSp: 18,
  readingTheme: 'sepia',
  fontFamily: 'serif',
  lineSpacingMultiplier: 1.7,
  autoAddOnTap: true,
  ttsAutoPlay: false,
};

// ========================
// UI State
// ========================

export interface WordLookupState {
  word: string;
  phonetic: string;
  translation: string;
  definition: string;
  partOfSpeech: string;
  example: string;
  contextSentence: string;
  isSaved: boolean;
  isAutoAdded: boolean;
}

export interface SentenceAnalysisState {
  originalText: string;
  translation: string;
  explanation: string;
  isFromAi: boolean;
  isLoading: boolean;
  error?: string;
}

// ========================
// Dictionary
// ========================

export interface DictEntry {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  translationUz: string;
  definitionEn: string;
  example: string;
}

// ========================
// Vocabulary Filter
// ========================

export type VocabFilter = 'Barchasi' | "O'rganilmoqda" | 'Yodlandi' | 'Sevimlilar';
export type NoteCategory = 'Barchasi' | 'Eslatmalar' | 'Insho' | 'Hikoya' | 'Kundalik' | "Lug'at mashqi";

// ========================
// Helpers
// ========================

export const READING_THEME_LABELS: Record<ReadingTheme, string> = {
  light: "Yorug'",
  sepia: 'Sepia (Issiq)',
  dark: "Tungi (Qorong'i)",
  night: 'Mutlaq Qora',
};

export const READING_FONT_LABELS: Record<ReadingFontFamily, string> = {
  serif: 'Serif (Kitobiy)',
  sans: 'Sans (Zamonaviy)',
  mono: 'Monospace (Aniq)',
};

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
