/**
 * ReadScribe App Context & State Management
 * Clean architecture replacing the 477-line Monster ViewModel with focused state handlers.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ReadingItem,
  VocabularyWord,
  WritingNote,
  ReaderSettings,
  DEFAULT_READER_SETTINGS,
  WordLookupState,
  SentenceAnalysisState,
  generateId,
} from '../types';
import { StorageService, UserProfile } from '../services/storage';
import { ENTRIES, findDictionaryEntry } from '../data/dictionary';
import { AiService } from '../services/ai';
import { SpeechService } from '../services/speech';

interface AppContextType {
  // Readings
  readings: ReadingItem[];
  selectedReading: ReadingItem | null;
  selectReading: (id: string | null) => void;
  updateReadingProgress: (id: string, scrollProgress: number, paragraph: number) => Promise<void>;
  markReadingFinished: (id: string, finished: boolean) => Promise<void>;
  addCustomReading: (title: string, author: string, category: string, content: string) => Promise<ReadingItem>;

  // Vocabulary
  vocabulary: VocabularyWord[];
  addWordToVocab: (word: string, contextSentence?: string, sourceTitle?: string) => Promise<VocabularyWord>;
  removeWordFromVocab: (id: string) => Promise<void>;
  toggleMastered: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;

  // Notes
  notes: WritingNote[];
  addNote: (title: string, category: string, content: string) => Promise<WritingNote>;
  updateNote: (id: string, title: string, category: string, content: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePinNote: (id: string) => Promise<void>;

  // Settings
  settings: ReaderSettings;
  updateSettings: (newSettings: Partial<ReaderSettings>) => Promise<void>;

  // User Profile
  profile: UserProfile;
  updateProfile: (newProfile: Partial<UserProfile>) => Promise<void>;
  addReadMinutes: (minutes: number) => Promise<void>;

  // Interactive Word Lookup Sheet
  lookupState: WordLookupState | null;
  openWordLookup: (word: string, contextSentence?: string, sourceTitle?: string) => void;
  closeWordLookup: () => void;
  saveLookupWord: () => Promise<void>;

  // Sentence Analysis AI Sheet
  analysisState: SentenceAnalysisState | null;
  openSentenceAnalysis: (sentence: string) => Promise<void>;
  closeSentenceAnalysis: () => void;

  // Speech
  speakText: (text: string) => void;

  // Loading
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [readings, setReadings] = useState<ReadingItem[]>([]);
  const [selectedReadingId, setSelectedReadingId] = useState<string | null>(null);
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [notes, setNotes] = useState<WritingNote[]>([]);
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_READER_SETTINGS);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'O‘rganuvchi',
    avatarSeed: 'scholar',
    dailyGoalMinutes: 15,
    streakDays: 3,
    lastActiveDate: new Date().toISOString().split('T')[0],
    totalMinutesRead: 45,
  });

  const [lookupState, setLookupState] = useState<WordLookupState | null>(null);
  const [currentLookupSource, setCurrentLookupSource] = useState<string>('');
  const [analysisState, setAnalysisState] = useState<SentenceAnalysisState | null>(null);

  // Initialize data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [loadedReadings, loadedVocab, loadedNotes, loadedSettings, loadedProfile] = await Promise.all([
          StorageService.getReadings(),
          StorageService.getVocabulary(),
          StorageService.getNotes(),
          StorageService.getSettings(),
          StorageService.getUserProfile(),
        ]);
        setReadings(loadedReadings);
        setVocabulary(loadedVocab);
        setNotes(loadedNotes);
        setSettings(loadedSettings);
        setProfile(loadedProfile);
      } catch (err) {
        console.error('Failed to initialize app state:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const selectedReading = readings.find((r) => r.id === selectedReadingId) || null;

  const selectReading = useCallback((id: string | null) => {
    setSelectedReadingId(id);
    if (id) {
      setReadings((prev) =>
        prev.map((r) => (r.id === id ? { ...r, lastReadTimestamp: Date.now() } : r))
      );
    }
  }, []);

  const updateReadingProgress = useCallback(
    async (id: string, scrollProgress: number, paragraph: number) => {
      const isFinished = scrollProgress >= 0.95;
      setReadings((prev) => {
        const updated = prev.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              scrollProgress: Math.min(1.0, Math.max(0, scrollProgress)),
              lastReadParagraph: paragraph,
              lastReadTimestamp: Date.now(),
              isFinished: item.isFinished || isFinished,
            };
          }
          return item;
        });
        StorageService.saveReadings(updated);
        return updated;
      });
    },
    []
  );

  const markReadingFinished = useCallback(async (id: string, finished: boolean) => {
    setReadings((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, isFinished: finished, scrollProgress: finished ? 1.0 : item.scrollProgress } : item
      );
      StorageService.saveReadings(updated);
      return updated;
    });
  }, []);

  const addCustomReading = useCallback(
    async (title: string, author: string, category: string, content: string): Promise<ReadingItem> => {
      const wordCount = content.trim().split(/\s+/).length;
      const estimatedMinutes = Math.max(1, Math.round(wordCount / 180));
      const newItem: ReadingItem = {
        id: generateId(),
        title: title.trim() || 'Yangi Matn',
        author: author.trim() || 'Muallif nomaʼlum',
        category: category || 'Shaxsiy',
        level: 'Foydalanuvchi matni',
        content: content.trim(),
        estimatedReadMinutes: estimatedMinutes,
        lastReadTimestamp: Date.now(),
        scrollProgress: 0,
        lastReadParagraph: 0,
        isFinished: false,
        isCustom: true,
        createdAt: Date.now(),
      };
      const updated = [newItem, ...readings];
      setReadings(updated);
      await StorageService.saveReadings(updated);
      return newItem;
    },
    [readings]
  );

  // Vocabulary handlers
  const addWordToVocab = useCallback(
    async (word: string, contextSentence: string = '', sourceTitle: string = ''): Promise<VocabularyWord> => {
      const cleanWord = word.trim().toLowerCase();
      // Check if already exists
      const existing = vocabulary.find((v) => v.word.toLowerCase() === cleanWord);
      if (existing) {
        return existing;
      }

      const dictEntry = findDictionaryEntry(cleanWord);
      const newWord: VocabularyWord = {
        id: generateId(),
        word: cleanWord,
        phonetic: dictEntry?.phonetic || '',
        translation: dictEntry?.translationUz || 'O‘zbekcha tarjimasi kiritilmagan',
        definition: dictEntry?.definitionEn || '',
        contextSentence: contextSentence || dictEntry?.example || '',
        sourceTitle: sourceTitle || 'ReadScribe',
        partOfSpeech: dictEntry?.partOfSpeech || 'noun',
        isMastered: false,
        isFavorite: false,
        reviewCount: 0,
        createdAt: Date.now(),
      };

      const updated = [newWord, ...vocabulary];
      setVocabulary(updated);
      await StorageService.saveVocabulary(updated);
      return newWord;
    },
    [vocabulary]
  );

  const removeWordFromVocab = useCallback(
    async (id: string) => {
      const updated = vocabulary.filter((v) => v.id !== id);
      setVocabulary(updated);
      await StorageService.saveVocabulary(updated);
    },
    [vocabulary]
  );

  const toggleMastered = useCallback(
    async (id: string) => {
      const updated = vocabulary.map((v) =>
        v.id === id ? { ...v, isMastered: !v.isMastered, reviewCount: v.reviewCount + 1 } : v
      );
      setVocabulary(updated);
      await StorageService.saveVocabulary(updated);
    },
    [vocabulary]
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const updated = vocabulary.map((v) => (v.id === id ? { ...v, isFavorite: !v.isFavorite } : v));
      setVocabulary(updated);
      await StorageService.saveVocabulary(updated);
    },
    [vocabulary]
  );

  // Notes handlers
  const addNote = useCallback(
    async (title: string, category: string, content: string): Promise<WritingNote> => {
      const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
      const newNote: WritingNote = {
        id: generateId(),
        title: title.trim() || 'Sarlavhasiz qayd',
        category: category || 'Eslatmalar',
        content,
        wordCount,
        isPinned: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const updated = [newNote, ...notes];
      setNotes(updated);
      await StorageService.saveNotes(updated);
      return newNote;
    },
    [notes]
  );

  const updateNote = useCallback(
    async (id: string, title: string, category: string, content: string) => {
      const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
      const updated = notes.map((n) =>
        n.id === id
          ? {
              ...n,
              title: title.trim() || 'Sarlavhasiz qayd',
              category: category || n.category,
              content,
              wordCount,
              updatedAt: Date.now(),
            }
          : n
      );
      setNotes(updated);
      await StorageService.saveNotes(updated);
    },
    [notes]
  );

  const deleteNote = useCallback(
    async (id: string) => {
      const updated = notes.filter((n) => n.id !== id);
      setNotes(updated);
      await StorageService.saveNotes(updated);
    },
    [notes]
  );

  const togglePinNote = useCallback(
    async (id: string) => {
      const updated = notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n));
      setNotes(updated);
      await StorageService.saveNotes(updated);
    },
    [notes]
  );

  // Settings
  const updateSettings = useCallback(
    async (newSettings: Partial<ReaderSettings>) => {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      await StorageService.saveSettings(updated);
    },
    [settings]
  );

  // Profile
  const updateProfile = useCallback(
    async (newProfile: Partial<UserProfile>) => {
      const updated = { ...profile, ...newProfile };
      setProfile(updated);
      await StorageService.saveUserProfile(updated);
    },
    [profile]
  );

  const addReadMinutes = useCallback(
    async (minutes: number) => {
      const updated = { ...profile, totalMinutesRead: profile.totalMinutesRead + minutes };
      setProfile(updated);
      await StorageService.saveUserProfile(updated);
    },
    [profile]
  );

  // Word lookup modal
  const openWordLookup = useCallback(
    (word: string, contextSentence: string = '', sourceTitle: string = '') => {
      const clean = word.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’]/g, '').trim().toLowerCase();
      if (!clean) return;

      const dictEntry = findDictionaryEntry(clean);
      const isAlreadySaved = vocabulary.some((v) => v.word.toLowerCase() === clean);
      let autoAdded = false;

      // Auto add if setting is enabled and not already saved
      if (settings.autoAddOnTap && !isAlreadySaved) {
        addWordToVocab(clean, contextSentence, sourceTitle);
        autoAdded = true;
      }

      setCurrentLookupSource(sourceTitle);
      setLookupState({
        word: clean,
        phonetic: dictEntry?.phonetic || '',
        translation: dictEntry?.translationUz || 'Lug‘atda topilmadi',
        definition: dictEntry?.definitionEn || 'No English definition available.',
        partOfSpeech: dictEntry?.partOfSpeech || 'word',
        example: dictEntry?.example || '',
        contextSentence,
        isSaved: isAlreadySaved || autoAdded,
        isAutoAdded: autoAdded,
      });

      SpeechService.speak(clean);
    },
    [settings.autoAddOnTap, vocabulary, addWordToVocab]
  );

  const closeWordLookup = useCallback(() => {
    setLookupState(null);
  }, []);

  const saveLookupWord = useCallback(async () => {
    if (!lookupState) return;
    await addWordToVocab(lookupState.word, lookupState.contextSentence, currentLookupSource);
    setLookupState((prev) => (prev ? { ...prev, isSaved: true } : null));
  }, [lookupState, addWordToVocab, currentLookupSource]);

  // Sentence analysis modal
  const openSentenceAnalysis = useCallback(async (sentence: string) => {
    const trimmed = sentence.trim();
    if (!trimmed) return;

    setAnalysisState({
      originalText: trimmed,
      translation: '',
      explanation: '',
      isFromAi: false,
      isLoading: true,
    });

    const result = await AiService.analyzeSentence(trimmed);

    setAnalysisState({
      originalText: trimmed,
      translation: result.translation,
      explanation: result.explanation,
      isFromAi: result.isFromAi,
      isLoading: false,
    });
  }, []);

  const closeSentenceAnalysis = useCallback(() => {
    setAnalysisState(null);
  }, []);

  const speakText = useCallback((text: string) => {
    SpeechService.speak(text);
  }, []);

  return (
    <AppContext.Provider
      value={{
        readings,
        selectedReading,
        selectReading,
        updateReadingProgress,
        markReadingFinished,
        addCustomReading,
        vocabulary,
        addWordToVocab,
        removeWordFromVocab,
        toggleMastered,
        toggleFavorite,
        notes,
        addNote,
        updateNote,
        deleteNote,
        togglePinNote,
        settings,
        updateSettings,
        profile,
        updateProfile,
        addReadMinutes,
        lookupState,
        openWordLookup,
        closeWordLookup,
        saveLookupWord,
        analysisState,
        openSentenceAnalysis,
        closeSentenceAnalysis,
        speakText,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
